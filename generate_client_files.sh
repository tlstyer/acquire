./node_modules/.bin/node-sass --style expanded --sourcemap=none --no-cache client/main/css/main.scss client/main/css/main.css
./node_modules/.bin/node-sass --style expanded --sourcemap=none --no-cache client/stats/css/stats.scss client/stats/css/stats.css
./server/enumsgen.py js development > client/main/js/enums.js
./node_modules/webpack/bin/webpack.js -d client/main/js/app.js client/main/js/main.js
