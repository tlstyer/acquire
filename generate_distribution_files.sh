./generate_client_files.sh

rm -rf dist
mkdir -p dist/build/js dist/web/static dist/web/stats

# favicon.ico
cp -a ../tlstyer.com/favicon.ico dist/web

# pre-existing static files
cp -a static/* dist/web/static

# server.py
cp server.py dist/server.py

# other .py files
cp -a cron.py enums.py orm.py dist

# main.css
./node_modules/clean-css/bin/cleancss --s0 css/main.css | sed "s/\.\.\/static\///" > dist/build/main.css
MAIN_CSS=$(sha1sum dist/build/main.css | awk '{ print $1 }').css
cp dist/build/main.css dist/web/static/${MAIN_CSS}

# start main.js and server.js
cp js/* server.js dist/build/js

# enums replacements in server.py and .js files
./enumsgen.py replace dist/server.py dist/build/js/*.js

# finish main.js
./enumsgen.py js release > dist/build/js/enums.js

cd dist/build/js
cp ../../../node_modules/almond/almond.js .
../../../node_modules/requirejs/bin/r.js -o optimize=none baseUrl=. name=almond.js wrap=true preserveLicenseComments=false include=main out=../main1.js
cd ../../..

./node_modules/uglify-js/bin/uglifyjs js/polyfill.array.indexof.js js/polyfill.string.trim.js dist/build/main1.js -m -b indent-level=0 -o dist/build/main2.js
MAIN_JS=$(sha1sum dist/build/main2.js | awk '{ print $1 }').js
cp dist/build/main2.js dist/web/static/${MAIN_JS}

# stats.js
sed "s/url: 'web\/stats\//url: '/" js/stats.js > dist/build/stats1.js
./node_modules/uglify-js/bin/uglifyjs js/polyfill.string.trim.js dist/build/stats1.js -o dist/build/stats2.js -m -c
STATS_JS=$(sha1sum dist/build/stats2.js | awk '{ print $1 }').js
cp dist/build/stats2.js dist/web/static/${STATS_JS}

# index.html
sed "s/<link rel=\"stylesheet\" href=\"css\/main.css\">/<link rel=\"stylesheet\" href=\"static\/${MAIN_CSS}\">/" index.html | \
sed "s/<script data-main=\"js\/main\" src=\"node_modules\/requirejs\/require.js\"><\/script>/<script src=\"static\/${MAIN_JS}\"><\/script>/" | \
./node_modules/html-minifier/cli.js \
	--remove-comments --collapse-whitespace --conservative-collapse --collapse-boolean-attributes --remove-attribute-quotes --remove-redundant-attributes --remove-optional-tags | \
sed 's/\s\s*/ /g' | sed 's/ $//' > dist/build/index.html

VERSION=$(sha1sum dist/build/index.html | awk '{ print $1 }')

sed "s/data-version=VERSION/data-version=${VERSION}/" dist/build/index.html > dist/web/index.html

# stats/index.html
sed "s/<link rel=\"stylesheet\" href=\"css\/main.css\">/<link rel=\"stylesheet\" href=\"\/static\/${MAIN_CSS}\">/" stats.html | \
sed "s/<script src=\"js\/stats.js\"><\/script>/<script src=\"\/static\/${STATS_JS}\"><\/script>/" | \
./node_modules/html-minifier/cli.js \
	--remove-comments --collapse-whitespace --conservative-collapse --collapse-boolean-attributes --remove-attribute-quotes --remove-redundant-attributes --remove-optional-tags | \
sed 's/\s\s*/ /g' | sed 's/ $//' > dist/web/stats/index.html

# finish server.js
sed "s/var server_version = 'VERSION';/var server_version = '${VERSION}';/" dist/build/js/server.js | \
sed "s/var enums = require('\.\/js\/enums');/\/\/ var enums = require('\.\/js\/enums');/" > dist/server.js
chmod u+x dist/server.js

# cleanup
rm -rf dist/build

# gzip
zopfli $(find dist/web -type f)
for f in $(find dist/web -type f | grep -v '\.gz$')
do
	touch -r $f $f.gz
done
