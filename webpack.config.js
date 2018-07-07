const fs = require('fs');
const path = require('path');
const HtmlWebpackExternalsPlugin = require('html-webpack-externals-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function getDevelopmentConfig(APP) {
    return {
        entry: {
            app: `./src/client/${APP}.tsx`,
        },
        output: {
            filename: `${APP}.js`,
            path: path.resolve(__dirname, 'dist'),
        },
        devtool: 'source-map',
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'Acquire',
                template: './src/client/index.html',
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                transpileOnly: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.js$/,
                    use: [
                        {
                            loader: 'source-map-loader',
                        },
                    ],
                    enforce: 'pre',
                },
                {
                    test: /\.css$/,
                    use: [
                        {
                            loader: 'style-loader',
                            options: {
                                sourceMap: true,
                            },
                        },
                        {
                            loader: 'typings-for-css-modules-loader',
                            options: {
                                modules: true,
                                localIdentName: '[name]-[local]',
                                sourceMap: true,
                                namedExport: true,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: loader => [
                                    require('postcss-import')({ root: loader.resourcePath }),
                                    require('postcss-url')({ url: 'inline' }),
                                    require('postcss-cssnext')(),
                                ],
                                sourceMap: true,
                            },
                        },
                    ],
                },
            ],
        },
        mode: 'development',
    };
}

function getProductionConfig(APP) {
    const shortCSSNameLookup = getShortCSSNameLookup();

    const externals = [
        {
            module: 'immutable',
            global: 'Immutable',
            entry: 'https://cdnjs.cloudflare.com/ajax/libs/immutable/4.0.0-rc.9/immutable.min.js',
        },
        {
            module: 'react',
            global: 'React',
            entry: 'https://cdnjs.cloudflare.com/ajax/libs/react/16.4.1/umd/react.production.min.js',
        },
        {
            module: 'react-dom',
            global: 'ReactDOM',
            entry: 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.4.1/umd/react-dom.production.min.js',
        },
    ];
    if (APP === 'index') {
        externals.push({
            module: 'sockjs-client',
            global: 'SockJS',
            entry: 'https://cdnjs.cloudflare.com/ajax/libs/sockjs-client/1.1.5/sockjs.min.js',
        });
    }

    return {
        entry: {
            app: `./src/client/${APP}.tsx`,
        },
        output: {
            filename: `${APP}.[contenthash].js`,
            path: path.resolve(__dirname, 'dist', 'client'),
        },
        resolve: {
            extensions: ['.ts', '.tsx', '.js', '.json'],
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'Acquire',
                template: './src/client/index.html',
                filename: `${APP}.html`,
                minify: {
                    collapseWhitespace: true,
                    removeAttributeQuotes: true,
                    removeOptionalTags: true,
                    removeScriptTypeAttributes: true,
                },
            }),
            new HtmlWebpackExternalsPlugin({
                externals,
            }),
            new MiniCssExtractPlugin({
                filename: `${APP}.[contenthash].css`,
            }),
        ],
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: 'awesome-typescript-loader',
                            options: {
                                configFileName: 'tsconfig.client.json',
                                errorsAsWarnings: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: 'typings-for-css-modules-loader',
                            options: {
                                modules: true,
                                getLocalIdent: (context, localIdentName, localName, options) => {
                                    const key = context.resourcePath + '-' + localName;
                                    const shortCSSName = shortCSSNameLookup[key];
                                    if (shortCSSName === undefined) {
                                        throw new Error(`short CSS name not specified for "${key}"`);
                                    }
                                    return shortCSSName;
                                },
                                namedExport: true,
                            },
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                ident: 'postcss',
                                plugins: loader => [
                                    require('postcss-import')({ root: loader.resourcePath }),
                                    require('postcss-url')({ url: 'inline' }),
                                    require('postcss-cssnext')(),
                                    require('cssnano')(),
                                ],
                            },
                        },
                    ],
                },
            ],
        },
        optimization: {
            splitChunks: {
                cacheGroups: {
                    styles: {
                        name: 'styles',
                        test: /\.css$/,
                        enforce: true,
                    },
                },
            },
        },
        mode: 'production',
    };
}

function getShortCSSNameLookup() {
    const keys = [];

    function processDirectory(dir) {
        const files = fs.readdirSync(dir);

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const filePath = path.join(dir, file);
            const stats = fs.statSync(filePath);

            if (stats.isDirectory()) {
                processDirectory(filePath);
            } else if (stats.isFile()) {
                if (file.endsWith('.css.d.ts')) {
                    const lines = fs
                        .readFileSync(filePath)
                        .toString()
                        .split('\n');
                    const cssFilePath = filePath.slice(0, filePath.length - 5);

                    for (let j = 0; j < lines.length; j++) {
                        const line = lines[j];
                        const match = line.match(/^export const (.*?): string;$/);

                        if (match) {
                            keys.push(`${cssFilePath}-${match[1]}`);
                        }
                    }
                }
            }
        }
    }

    processDirectory(path.join(__dirname, 'src'));

    keys.sort();

    const lookup = {};
    for (let i = 0; i < keys.length; i++) {
        lookup[keys[i]] = `_${i.toString(36)}`;
    }

    return lookup;
}

const { APP, MODE } = process.env;

module.exports = MODE === 'production' ? getProductionConfig(APP) : getDevelopmentConfig(APP);
