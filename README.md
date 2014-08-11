# Acquire board game

This is the code for my Acquire board game program which can be played at [http://acquire.tlstyer.com/](http://acquire.tlstyer.com/).

## Install Dependencies

    sudo apt-get install nodejs npm python3-pip ruby zopfli
    npm install almond clean-css html-minifier normalize.css requirejs socket.io
    sudo gem install sass
    sudo pip3 install ujson

## Upgrade Dependencies

The apt-get packages are upgraded by your system. To upgrade the other dependencies, rerun ```npm install ...``` and ```sudo gem ...``` from Install Dependencies and run this:

    sudo pip3 install --upgrade ujson
