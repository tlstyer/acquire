TIMESTAMP=$(date +%s)

./generate_client_files.sh

rm -rf dist
mkdir -p dist/web/static
mkdir -p dist/build/js

# favicon.ico
cp -a ../tlstyer.com/favicon.ico dist/web

# pre-existing static files
cp -a static/* dist/web/static

# server.js
cp -a server.js dist/server.js

# server.py
sed "s/version = 'VERSION'/version = '${TIMESTAMP}'/" server.py > dist/server.py
chmod u+x dist/server.py

# enums.py
cp -a enums.py dist

# index.html
sed "s/<link rel=\"stylesheet\" href=\"css\/main.css\">/<link rel=\"stylesheet\" href=\"static\/${TIMESTAMP}.css\">/" index.html | \
sed "s/<script data-main=\"js\/main\" src=\"node_modules\/requirejs\/require.js\"><\/script>/<script src=\"static\/${TIMESTAMP}.js\"><\/script>/" | \
sed "s/data-version=\"VERSION\"/data-version=\"${TIMESTAMP}\"/" | \
./node_modules/html-minifier/cli.js \
	--remove-comments --collapse-whitespace --conservative-collapse --collapse-boolean-attributes --remove-attribute-quotes --remove-redundant-attributes --remove-optional-tags \
	-o dist/web/index.html

# ${TIMESTAMP}.css
./node_modules/clean-css/bin/cleancss --s0 css/main.css | sed "s/\.\.\/static\///" > dist/web/static/${TIMESTAMP}.css

# start ${TIMESTAMP}.js
cp js/* dist/build/js

# enums replacements in server.py and .js files
./enumsgen.py replace dist/server.py dist/build/js/*.js

# finish # ${TIMESTAMP}.js
./enumsgen.py js release > dist/build/js/enums.js

pushd . > /dev/null
cd dist/build/js
cp ../../../node_modules/almond/almond.js .
../../../node_modules/requirejs/bin/r.js -o baseUrl=. name=almond.js wrap=true preserveLicenseComments=false include=main out=../../web/static/${TIMESTAMP}.js
popd > /dev/null

# cleanup
rm -rf dist/build

# gzip
gzip -kn9 $(find dist/web -type f)
