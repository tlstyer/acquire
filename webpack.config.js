const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
            filename: '[hash].js',
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
                        {
                            loader: 'style-loader',
                        },
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
                                ],
                            },
                        },
                    ],
                },
            ],
        },
        mode: 'production',
    };
}

const { APP, MODE } = process.env;

module.exports = MODE === 'production' ? getProductionConfig(APP) : getDevelopmentConfig(APP);
