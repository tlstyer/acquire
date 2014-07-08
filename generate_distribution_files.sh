TIMESTAMP=$(date +%s)

./generate_client_files.sh

mkdir -p dist
rm -rf dist/*
mkdir -p dist/web/static

# index.html
sed "s/<link rel=\"stylesheet\" href=\"css\/main.css\">/<link rel=\"stylesheet\" href=\"static\/${TIMESTAMP}.css\">/" index.html | \
sed "s/<script data-main=\"js\/main\" src=\"node_modules\/requirejs\/require.js\"><\/script>/<script src=\"static\/${TIMESTAMP}.js\"><\/script>/" | \
./node_modules/html-minifier/cli.js \
	--remove-comments --collapse-whitespace --conservative-collapse --collapse-boolean-attributes --remove-attribute-quotes --remove-redundant-attributes --remove-optional-tags \
	-o dist/web/index.html

# main.css
./node_modules/requirejs/bin/r.js -o cssIn=css/main.css out=dist/web/main.css
./node_modules/clean-css/bin/cleancss -o dist/web/static/${TIMESTAMP}.css dist/web/main.css
rm dist/web/main.css

# main.js
cd js
../node_modules/requirejs/bin/r.js -o baseUrl=. name=../node_modules/almond/almond.js wrap=true include=main out=../dist/web/static/${TIMESTAMP}.js
cd ..

# enums.py
cp enums.py dist

# server.py
cp server.py dist
