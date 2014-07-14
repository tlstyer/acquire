TIMESTAMP=$(date +%s)

./generate_client_files.sh

rm -rf dist
mkdir -p dist/web/static
mkdir -p dist/build/js

# pre-existing static files
cp -a static/* dist/web/static

# server.py
sed "s/version = 'VERSION'/version = '${TIMESTAMP}'/" server.py | ./generate_distribution_files_helper.py enums > dist/server.py
chmod u+x dist/server.py

# enums.py
cp enums.py dist

# index.html
sed "s/<link rel=\"stylesheet\" href=\"css\/main.css\">/<link rel=\"stylesheet\" href=\"static\/${TIMESTAMP}.css\">/" index.html | \
sed "s/<script data-main=\"js\/main\" src=\"node_modules\/requirejs\/require.js\"><\/script>/<script src=\"static\/${TIMESTAMP}.js\"><\/script>/" | \
sed "s/data-version=\"VERSION\"/data-version=\"${TIMESTAMP}\"/" | \
./node_modules/html-minifier/cli.js \
	--remove-comments --collapse-whitespace --conservative-collapse --collapse-boolean-attributes --remove-attribute-quotes --remove-redundant-attributes --remove-optional-tags \
	-o dist/web/index.html

# ${TIMESTAMP}.css
./node_modules/requirejs/bin/r.js -o cssIn=css/main.css out=dist/build/main.css
./node_modules/clean-css/bin/cleancss -o dist/web/static/${TIMESTAMP}.css dist/build/main.css

# ${TIMESTAMP}.js
for f in js/*.js
do
	cat $f | ./generate_distribution_files_helper.py enums > dist/build/$f
done

./generate_enums_js.py dist > dist/build/js/enums.js

pushd . > /dev/null
cd dist/build/js
cp ../../../node_modules/almond/almond.js .
../../../node_modules/requirejs/bin/r.js -o baseUrl=. name=almond.js wrap=true preserveLicenseComments=false include=main out=../../web/static/${TIMESTAMP}.js
popd > /dev/null

# cleanup
rm -rf dist/build
