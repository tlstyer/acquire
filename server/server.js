#!/usr/bin/env nodejs

(function () {
  'use strict';

  var express = require('express');
  var app = express();
  var body_parser = require('body-parser');
  var http = require('http');
  var server = http.createServer(app);

  var sockjs = require('sockjs');
  var sockjs_server = sockjs.createServer({
    heartbeat_delay: 20000,
    disconnect_delay: 35000,
    sockjs_url: '//cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.5.0/sockjs.min.js',
  });

  server.listen('javascript.sock');

  var mysql = require('mysql');
  var pool = mysql.createPool({
    socketPath: '/var/run/mysqld/mysqld.sock',
    user: 'acquire',
    password: 'acquire',
    database: 'acquire',
    charset: 'utf8mb4',
  });

  var server_version = 'VERSION';
  var enums = require('../client/main/js/enums');

  function isASCII(string) {
    var i,
      string_length = string.length,
      char_code;

    for (i = 0; i < string_length; i++) {
      char_code = string.charCodeAt(i);
      if (char_code < 32 || char_code > 126) {
        return false;
      }
    }
    return true;
  }

  app.use(
    body_parser.urlencoded({
      extended: false,
    })
  );
  app.post('/server/report-error', function (req, res) {
    var message = Object.prototype.hasOwnProperty.call(req.body, 'message') ? req.body.message.replace(/\n/g, '\n\t') : '<null>',
      trace = Object.prototype.hasOwnProperty.call(req.body, 'trace') ? req.body.trace.replace(/\n/g, '\n\t') : '<null>';

    console.log('/server/report-error:', message);
    console.log('\t' + trace);
    console.log(' ', req.headers);

    res.end();
  });
  app.post('/server/set-password', function (req, res) {
    var version = Object.prototype.hasOwnProperty.call(req.body, 'version') ? req.body.version.replace(/\s+/g, ' ').trim() : '',
      username = Object.prototype.hasOwnProperty.call(req.body, 'username') ? req.body.username.replace(/\s+/g, ' ').trim() : '',
      password = Object.prototype.hasOwnProperty.call(req.body, 'password') ? req.body.password.replace(/\s+/g, ' ').trim() : '',
      ip_address = Object.prototype.hasOwnProperty.call(req.headers, 'x-real-ip') ? req.headers['x-real-ip'] : req.address.address,
      fields;

    res.setHeader('Content-Type', 'application/json');

    var return_result = function (error_id) {
      console.log('/server/set-password', version, username, password, ip_address, error_id);
      res.end(String(error_id));
    };

    if (version !== server_version) {
      return_result(enums.Errors.NotUsingLatestVersion);
    } else if (username.length < 1 || username.length > 32 || !isASCII(username)) {
      return_result(enums.Errors.InvalidUsername);
    } else if (!/^[0-9a-f]{64}$/.test(password)) {
      return_result(enums.Errors.GenericError);
    } else {
      pool.query('select * from user where name = ?', [username], function (err, results) {
        if (err === null) {
          if (results.length === 1) {
            if (results[0].password === null) {
              // set user's password
              fields = {
                password: password,
              };
              pool.query('update user set ? where user_id = ?', [fields, results[0].user_id], function (err) {
                if (err === null) {
                  return_result(null);
                } else {
                  return_result(enums.Errors.GenericError);
                }
              });
            } else {
              // password already set
              return_result(enums.Errors.ExistingPassword);
            }
          } else {
            // insert user
            fields = {
              name: username,
              password: password,
            };
            pool.query('insert into user set ?', [fields], function (err) {
              if (err === null) {
                return_result(null);
              } else {
                return_result(enums.Errors.GenericError);
              }
            });
          }
        } else {
          return_result(enums.Errors.GenericError);
        }
      });
    }
  });

  var python_server = require('net').Socket();
  python_server.connect({
    path: 'python.sock',
  });

  var unprocessed_data = [];
  python_server.on('data', function (data) {
    var start_index = 0,
      data_length,
      index,
      key_and_value,
      space_index,
      key,
      value,
      parts,
      socket_id,
      client_id,
      socket,
      client_ids,
      length,
      i;

    data = data.toString();
    data_length = data.length;

    while (start_index < data_length) {
      index = data.indexOf('\n', start_index);
      if (index >= 0) {
        key_and_value = data.substring(start_index, index);
        start_index = index + 1;

        if (unprocessed_data.length > 0) {
          key_and_value = unprocessed_data.join('') + key_and_value;
          unprocessed_data = [];
        }

        space_index = key_and_value.indexOf(' ');
        key = key_and_value.substr(0, space_index);
        value = key_and_value.substr(space_index + 1);

        if (key === 'connect') {
          parts = JSON.parse(value);
          socket_id = parts[0];
          client_id = parts[1];
          socket_id_to_client_id[socket_id] = client_id;
          client_id_to_socket[client_id] = socket_id_to_socket[socket_id];
        } else if (key === 'disconnect') {
          socket = client_id_to_socket[value];
          if (socket) {
            socket.close();
          }
        } else {
          client_ids = key.split(',');
          length = client_ids.length;
          for (i = 0; i < length; i++) {
            socket = client_id_to_socket[client_ids[i]];
            if (socket) {
              socket.write(value);
            } else {
              console.log('ERROR! client_id ===', client_ids[i], value);
              python_server.write('disconnect ' + client_ids[i] + '\n');
            }
          }
        }
      } else {
        unprocessed_data.push(data.substring(start_index));
        break;
      }
    }
  });

  var socket_id_to_socket = {};
  var socket_id_to_client_id = {};
  var client_id_to_socket = {};

  function handle_login(socket, version, username, password) {
    var ip_address = socket.headers['x-real-ip'];

    version = version.replace(/\s+/g, ' ').trim();
    username = username.replace(/\s+/g, ' ').trim();
    password = password.replace(/\s+/g, ' ').trim();

    console.log(socket.id, 'login', version, username, password, ip_address);

    socket_id_to_socket[socket.id] = socket;
    socket_id_to_client_id[socket.id] = null;

    var return_fatal_error = function (error_id) {
      console.log(socket.id, 'return_fatal_error', error_id);
      socket.write(JSON.stringify([[enums.CommandsToClient.FatalError, error_id]]));
      socket.close();
    };

    var pass_to_python = function (replace_existing_user) {
      console.log(socket.id, 'pass_to_python');
      python_server.write('connect ' + JSON.stringify([username, ip_address, socket.id, replace_existing_user]) + '\n');
    };

    if (version !== server_version) {
      return_fatal_error(enums.Errors.NotUsingLatestVersion);
    } else if (username.length < 1 || username.length > 32 || !isASCII(username)) {
      return_fatal_error(enums.Errors.InvalidUsername);
    } else {
      pool.query('select * from user where name = ?', [username], function (err, results) {
        console.log(socket.id, 'query_result', err, results);
        if (err === null) {
          if (results.length === 1) {
            if (results[0].password === null) {
              if (password.length > 0) {
                return_fatal_error(enums.Errors.ProvidedPassword);
              } else {
                pass_to_python(false);
              }
            } else {
              if (password.length === 0) {
                return_fatal_error(enums.Errors.MissingPassword);
              } else if (password !== results[0].password) {
                return_fatal_error(enums.Errors.IncorrectPassword);
              } else {
                pass_to_python(true);
              }
            }
          } else {
            if (password.length > 0) {
              return_fatal_error(enums.Errors.ProvidedPassword);
            } else {
              pass_to_python(false);
            }
          }
        } else {
          return_fatal_error(enums.Errors.GenericError);
        }
      });
    }
  }

  sockjs_server.on('connection', function (socket) {
    var initializing = true;

    console.log(socket.id, 'connect');

    socket.on('close', function () {
      var client_id = socket_id_to_client_id[socket.id];

      console.log(socket.id, 'disconnect');

      delete socket_id_to_socket[socket.id];
      delete socket_id_to_client_id[socket.id];
      if (client_id) {
        delete client_id_to_socket[client_id];

        python_server.write('disconnect ' + client_id + '\n');
      }
    });

    socket.on('data', function (data) {
      if (initializing) {
        var parsed_data, version, username, password;

        try {
          parsed_data = JSON.parse(data);
          version = parsed_data[0];
          username = parsed_data[1];
          password = parsed_data[2];
          handle_login(socket, version, username, password);
        } catch (e) {
          console.log('initializing error: ', JSON.stringify(e));
          socket.close();
        }

        initializing = false;
      } else {
        var client_id = socket_id_to_client_id[socket.id];

        if (client_id) {
          python_server.write(client_id + ' ' + data.replace(/\s+/g, ' ') + '\n');
        }
      }
    });
  });

  sockjs_server.installHandlers(server, {
    prefix: '/sockjs',
  });
})();
