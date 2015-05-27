sass --style expanded --sourcemap=none --no-cache css/main.scss css/main.css
./enumsgen.py js development > js/enums.js
./node_modules/webpack/bin/webpack.js -d js/app.js js/main.js
