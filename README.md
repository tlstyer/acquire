# Acquire board game

This is the code for my Acquire board game program which can be played at [http://acquire.tlstyer.com/](http://acquire.tlstyer.com/).

## Install Development Dependencies

    sudo apt-get install nodejs npm python3-pip ruby zopfli
    npm install body-parser clean-css express html-minifier mysql normalize.css sockjs uglify-js webpack
    sudo gem install sass
    sudo pip3 install --upgrade --allow-external mysql-connector-python mysql-connector-python==1.2.3 pytz sqlalchemy trueskill ujson

## Install Server Dependencies

    sudo apt-get install nodejs npm python3-pip zopfli
    npm install body-parser express mysql sockjs
    sudo pip3 install --upgrade --allow-external mysql-connector-python mysql-connector-python==1.2.3 sqlalchemy trueskill ujson

## Upgrade Dependencies

The apt-get packages are upgraded by your system. To upgrade the other dependencies, rerun the relevant commands.

## Download Libraries

    cd lib
    curl http://cdnjs.cloudflare.com/ajax/libs/crypto-js/3.1.2/rollups/sha256.js > crypto-js.rollups.sha256-3.1.2.js
    curl http://cdnjs.cloudflare.com/ajax/libs/dygraph/1.1.1/dygraph-combined.js > dygraph-combined-1.1.1.js
    curl http://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.3/jquery.min.js > jquery-1.11.3.js
    curl http://cdnjs.cloudflare.com/ajax/libs/history.js/1.8/native.history.min.js > native.history-1.8.js
    curl http://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.0.0/sockjs.min.js > sockjs-1.0.0.js
    curl http://cdnjs.cloudflare.com/ajax/libs/stacktrace.js/0.6.4/stacktrace.min.js > stacktrace-0.6.4.js
