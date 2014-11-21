# Acquire board game

This is the code for my Acquire board game program which can be played at [http://acquire.tlstyer.com/](http://acquire.tlstyer.com/).

## Install Development Dependencies

    sudo apt-get install nodejs npm python3-pip ruby zopfli
    npm install almond amdefine body-parser clean-css express html-minifier mysql normalize.css requirejs socket.io uglify-js
    sudo gem install sass
    sudo pip3 install --upgrade --allow-external mysql-connector-python mysql-connector-python==1.2.3 sqlalchemy trueskill ujson

## Install Server Dependencies

    sudo apt-get install nodejs npm python3-pip zopfli
    npm install body-parser express mysql socket.io
    sudo pip3 install --upgrade --allow-external mysql-connector-python mysql-connector-python==1.2.3 sqlalchemy trueskill ujson

## Upgrade Dependencies

The apt-get packages are upgraded by your system. To upgrade the other dependencies, rerun the relevant commands.

## Download Libraries

    cd lib
    curl http://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/sha256.js > crypto-js.rollups.sha256-3.1.2.min.js
    curl http://cdnjs.cloudflare.com/ajax/libs/dygraph/1.0.1/dygraph-combined.min.js > dygraph-combined-1.0.1.min.js
    curl http://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.1/jquery.min.js > jquery-1.11.1.min.js
    curl http://cdnjs.cloudflare.com/ajax/libs/json2/20140204/json2.min.js > json2-20140204.min.js
    curl http://cdnjs.cloudflare.com/ajax/libs/history.js/1.8/native.history.min.js > native.history-1.8.min.js
    curl http://cdnjs.cloudflare.com/ajax/libs/stacktrace.js/0.6.4/stacktrace.min.js > stacktrace-0.6.4.min.js
