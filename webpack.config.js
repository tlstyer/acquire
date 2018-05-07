const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const { APP } = process.env;

let entry;
switch (APP) {
    case 'examples':
        entry = './src/client/examples.tsx';
        break;
    case 'review':
        entry = './src/client/review.tsx';
        break;
}

module.exports = {
    entry: {
        app: entry,
    },
    output: {
        filename: '[name].bundle.js',
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
