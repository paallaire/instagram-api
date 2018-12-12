const args = require('yargs').argv;
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const isProd = args.env === 'production';

module.exports = {
    mode: isProd ? 'production' : 'development',
    output: {
        filename: '[name].js',
    },
    devtool: !isProd ? 'inline-source-map' : false,
    module: {
        rules: [{
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
                productionMode: isProd,
            },
        },
        {
            test: /\.js$/,
            exclude: /node_modules/,
            use: {
                loader: 'babel-loader',
                options: {
                    presets: ['@babel/preset-env'],
                    cacheDirectory: true,
                },
            },
        },
        ],
    },
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm.js',
            vuex: 'vuex/dist/vuex.esm.js',
        },
    },
    plugins: [
        new VueLoaderPlugin(),
    ],
};
