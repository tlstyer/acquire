rm -rf dist/*
mkdir -p dist/build/js dist/web/static dist/web/stats

# external dependencies
cp -a package.json yarn.lock requirements.txt dist

# sass
./node_modules/.bin/node-sass --style expanded --sourcemap=none --no-cache client/main/css/main.scss client/main/css/main.css
./node_modules/.bin/node-sass --style expanded --sourcemap=none --no-cache client/stats/css/stats.scss client/stats/css/stats.css

# favicon.ico
cp -a ../tlstyer.com/favicon.ico dist/web

# pre-existing static files
cp -a client/main/static/* dist/web/static

# server.py
cp server/server.py dist/server.py

# other .py files
cp -a server/cron.py server/enums.py server/orm.py server/settings.py server/util.py dist

# main.css
./node_modules/clean-css/bin/cleancss --s0 client/main/css/main.css | sed "s/\.\.\/static\///" > dist/build/main.css
MAIN_CSS=$(sha1sum dist/build/main.css | awk '{ print $1 }').css
cp dist/build/main.css dist/web/static/${MAIN_CSS}

# stats.css
./node_modules/clean-css/bin/cleancss --s0 client/stats/css/stats.css | sed "s/\.\.\/static\///" > dist/build/stats.css
STATS_CSS=$(sha1sum dist/build/stats.css | awk '{ print $1 }').css
cp dist/build/stats.css dist/web/static/${STATS_CSS}

# start main.js and server.js
cp client/main/js/* server/server.js dist/build/js
rm dist/build/js/main.js*

# enums replacements in server.py and .js files
./server/enumsgen.py replace dist/server.py dist/build/js/*.js

# finish main.js
./server/enumsgen.py js release > dist/build/js/enums.js

./node_modules/webpack/bin/webpack.js dist/build/js/app.js dist/build/main1.js

./node_modules/uglify-js/bin/uglifyjs client/misc/js/polyfill_array_indexof.js client/misc/js/polyfill_string_trim.js dist/build/main1.js -m -b indent-level=0 -o dist/build/main2.js
MAIN_JS=$(sha1sum dist/build/main2.js | awk '{ print $1 }').js
cp dist/build/main2.js dist/web/static/${MAIN_JS}

# stats.js
sed "s/url: 'data\//url: '/" client/stats/js/stats.js > dist/build/stats1.js
./node_modules/uglify-js/bin/uglifyjs client/misc/js/polyfill_string_trim.js dist/build/stats1.js -m -b indent-level=0 -o dist/build/stats2.js
STATS_JS=$(sha1sum dist/build/stats2.js | awk '{ print $1 }').js
cp dist/build/stats2.js dist/web/static/${STATS_JS}

# index.html
sed "s/<link rel=\"stylesheet\" href=\"css\/main.css\">/<link rel=\"stylesheet\" href=\"static\/${MAIN_CSS}\">/" client/main/index.html | \
sed "s/<script src=\"js\/main.js\"><\/script>/<script src=\"static\/${MAIN_JS}\"><\/script>/" | \
./node_modules/html-minifier/cli.js \
	--remove-comments --collapse-whitespace --conservative-collapse --collapse-boolean-attributes --remove-attribute-quotes --remove-redundant-attributes --remove-optional-tags | \
sed 's/\s\s*/ /g' | sed 's/ $//' > dist/build/index.html

VERSION=$(sha1sum dist/build/index.html | awk '{ print $1 }')

sed "s/data-version=VERSION/data-version=${VERSION}/" dist/build/index.html > dist/web/index.html

# stats/index.html
sed "s/<link rel=\"stylesheet\" href=\"css\/stats.css\">/<link rel=\"stylesheet\" href=\"\/static\/${STATS_CSS}\">/" client/stats/index.html | \
sed "s/<script src=\"js\/stats.js\"><\/script>/<script src=\"\/static\/${STATS_JS}\"><\/script>/" | \
./node_modules/html-minifier/cli.js \
	--remove-comments --collapse-whitespace --conservative-collapse --collapse-boolean-attributes --remove-attribute-quotes --remove-redundant-attributes --remove-optional-tags | \
sed 's/\s\s*/ /g' | sed 's/ $//' > dist/web/stats/index.html

# finish server.js
sed "s/var server_version = 'VERSION';/var server_version = '${VERSION}';/" dist/build/js/server.js | \
sed "s/var enums = require('\.\.\/client\/main\/js\/enums');/\/\/ var enums = require('\.\.\/client\/main\/js\/enums');/" > dist/server.js
chmod u+x dist/server.js

# cleanup
rm -rf dist/build

# gzip
zopfli $(find dist/web -type f)
for f in $(find dist/web -type f | grep -v '\.gz$')
do
	touch -r $f $f.gz
done
