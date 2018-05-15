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
    const classNameMap = {};
    let nextID = 0;

    return {
        entry: {
            app: `./src/client/${APP}.tsx`,
        },
        output: {
            filename: `${APP}.[chunkhash].js`,
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
                externals: [
                    {
                        module: 'immutable',
                        global: 'Immutable',
                        entry: 'https://cdnjs.cloudflare.com/ajax/libs/immutable/4.0.0-rc.9/immutable.min.js',
                    },
                    {
                        module: 'react',
                        global: 'React',
                        entry: 'https://cdnjs.cloudflare.com/ajax/libs/react/16.3.2/umd/react.production.min.js',
                    },
                    {
                        module: 'react-dom',
                        global: 'ReactDOM',
                        entry: 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/16.3.2/umd/react-dom.production.min.js',
                    },
                ],
            }),
            new MiniCssExtractPlugin({
                filename: `${APP}.[chunkhash].css`,
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
                                    if (!classNameMap[key]) {
                                        classNameMap[key] = '_' + nextID.toString(36);
                                        nextID++;
                                    }
                                    return classNameMap[key];
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

const { APP, MODE } = process.env;

module.exports = MODE === 'production' ? getProductionConfig(APP) : getDevelopmentConfig(APP);
