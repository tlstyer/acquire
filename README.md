# Acquire board game

This is the code for my Acquire board game program which can be played at [http://acquire.tlstyer.com/](http://acquire.tlstyer.com/).

## Install Development Dependencies

Install [yarn](https://yarnpkg.com/en/docs/cli/install).

    sudo apt-get install nodejs python3-pip ruby zopfli
    yarn
    sudo gem install sass
    sudo pip3 install --upgrade --allow-external mysql-connector-python mysql-connector-python==1.2.3 pytz sqlalchemy trueskill ujson

## Install Server Dependencies

Install [yarn](https://yarnpkg.com/en/docs/cli/install).

    sudo apt-get install nodejs python3-pip zopfli
    yarn --prod
    sudo pip3 install --upgrade --allow-external mysql-connector-python mysql-connector-python==1.2.3 sqlalchemy trueskill ujson

## Upgrade Dependencies

The apt-get packages are upgraded by your system. To upgrade the other dependencies, rerun the relevant commands.

## Download Libraries

    cd lib
    curl http://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/sha256.js > crypto-js.rollups.sha256-3.1.2.js
    curl http://cdnjs.cloudflare.com/ajax/libs/dygraph/1.1.1/dygraph-combined.js > dygraph-combined-1.1.1.js
    curl http://cdnjs.cloudflare.com/ajax/libs/jquery/1.12.4/jquery.min.js > jquery-1.12.4.js
    curl http://cdnjs.cloudflare.com/ajax/libs/json3/3.3.2/json3.min.js > json3-3.3.2.js
    curl http://cdnjs.cloudflare.com/ajax/libs/history.js/1.8/native.history.min.js > native.history-1.8.js
    curl http://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.1.1/sockjs.min.js > sockjs-1.1.1.js
    curl http://cdnjs.cloudflare.com/ajax/libs/stacktrace.js/1.3.1/stacktrace-with-promises-and-json-polyfills.min.js > stacktrace-1.3.1.js
