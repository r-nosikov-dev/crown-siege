const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/i,
                type: 'asset/resource',
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'PixiJS Mini-Game',
            template: './src/index.html',
        }),
        new CopyPlugin({
            patterns: [
                { from: 'src/assets', to: 'assets', noErrorOnMissing: true },
                { from: 'src/sound', to: 'sound', noErrorOnMissing: true },
                { from: 'src/sprites', to: 'sprites', noErrorOnMissing: true },
            ],
        }),
    ],
    devServer: {
        static: './dist',
        hot: true,
    },
};
