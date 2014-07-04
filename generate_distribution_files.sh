TIMESTAMP=$(date +%s)

./generate_client_files.sh

mkdir -p dist
rm -rf dist/*
mkdir dist/static

# index.html
sed "s/<link rel=\"stylesheet\" href=\"css\/main.css\">/<link rel=\"stylesheet\" href=\"static\/${TIMESTAMP}.css\">/" index.html | \
sed "s/<script data-main=\"js\/main\" src=\"node_modules\/requirejs\/require.js\"><\/script>/<script src=\"static\/${TIMESTAMP}.js\"><\/script>/" | \
./node_modules/html-minifier/cli.js \
	--remove-comments --collapse-whitespace --conservative-collapse --collapse-boolean-attributes --remove-attribute-quotes --remove-redundant-attributes --remove-optional-tags \
	-o dist/index.html

# main.css
./node_modules/requirejs/bin/r.js -o cssIn=css/main.css out=dist/main.css
./node_modules/clean-css/bin/cleancss -o dist/static/${TIMESTAMP}.css dist/main.css
rm dist/main.css

# main.js
cd js
../node_modules/requirejs/bin/r.js -o baseUrl=. name=../node_modules/almond/almond.js wrap=true include=main out=../dist/static/${TIMESTAMP}.js
cd ..
