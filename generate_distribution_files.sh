TIMESTAMP=$(date +%s)

./generate_client_files.sh

rm -rf dist
mkdir -p dist/web/static
mkdir -p dist/web/stats
mkdir -p dist/build/js

# favicon.ico
cp -a ../tlstyer.com/favicon.ico dist/web

# pre-existing static files
cp -a static/* dist/web/static

# server.py
cp server.py dist/server.py

# other .py files
cp -a cron.py enums.py orm.py dist

# index.html
sed "s/<link rel=\"stylesheet\" href=\"css\/main.css\">/<link rel=\"stylesheet\" href=\"static\/${TIMESTAMP}.css\">/" index.html | \
sed "s/<script data-main=\"js\/main\" src=\"node_modules\/requirejs\/require.js\"><\/script>/<script src=\"static\/${TIMESTAMP}.js\"><\/script>/" | \
sed "s/data-version=\"VERSION\"/data-version=\"${TIMESTAMP}\"/" | \
./node_modules/html-minifier/cli.js \
	--remove-comments --collapse-whitespace --conservative-collapse --collapse-boolean-attributes --remove-attribute-quotes --remove-redundant-attributes --remove-optional-tags \
	-o dist/build/index.html
sed 's/\s\s*/ /g' dist/build/index.html | sed 's/ $//' > dist/web/index.html

# ${TIMESTAMP}.css
./node_modules/clean-css/bin/cleancss --s0 css/main.css | sed "s/\.\.\/static\///" > dist/web/static/${TIMESTAMP}.css

# start ${TIMESTAMP}.js and server.js
cp js/* server.js dist/build/js

# enums replacements in server.py and .js files
./enumsgen.py replace dist/server.py dist/build/js/*.js

# finish # ${TIMESTAMP}.js
./enumsgen.py js release > dist/build/js/enums.js

cd dist/build/js
cp ../../../node_modules/almond/almond.js .
../../../node_modules/requirejs/bin/r.js -o baseUrl=. name=almond.js wrap=true preserveLicenseComments=false include=main out=../../web/static/${TIMESTAMP}.js
cd ../../..

# finish server.js
sed "s/var server_version = 'VERSION';/var server_version = '${TIMESTAMP}';/" dist/build/js/server.js | \
sed "s/var enums = require('\.\/js\/enums');/\/\/ var enums = require('\.\/js\/enums');/" > dist/server.js
chmod u+x dist/server.js

# stats/index.html
sed "s/<link rel=\"stylesheet\" href=\"css\/main.css\">/<link rel=\"stylesheet\" href=\"\/static\/${TIMESTAMP}.css\">/" stats.html | \
sed "s/<script src=\"js\/stats.js\"><\/script>/<script src=\"\/static\/${TIMESTAMP}-stats.js\"><\/script>/" | \
./node_modules/html-minifier/cli.js \
	--remove-comments --collapse-whitespace --conservative-collapse --collapse-boolean-attributes --remove-attribute-quotes --remove-redundant-attributes --remove-optional-tags \
	-o dist/build/stats.html
sed 's/\s\s*/ /g' dist/build/stats.html | sed 's/ $//' > dist/web/stats/index.html

# ${TIMESTAMP}-stats.js
sed "s/url: 'web\/stats\//url: '/" js/stats.js | ./node_modules/uglify-js/bin/uglifyjs -o dist/web/static/${TIMESTAMP}-stats.js -m -c

# cleanup
rm -rf dist/build

# gzip
zopfli $(find dist/web -type f)
for f in $(find dist/web -type f | grep -v '\.gz$')
do
	touch -r $f $f.gz
done
