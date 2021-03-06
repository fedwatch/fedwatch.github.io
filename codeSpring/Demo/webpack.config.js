"use strict";

var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');


/*
 @init 环境定义
 @Description 方便NPM调试
 */
var ENV = process.env.npm_lifecycle_event;
var isTest = ENV === 'test' || ENV === 'test-watch';
var isProd = ENV === 'build';


module.exports = function makeWebpackConfig() {
    var config = {};
    config.entry = isTest ? {} : {
        app: './src/app/app.js'
    };
    config.output = isTest ? {} : {
        // Absolute output directory
        path: __dirname + '/dist',

        publicPath: isProd ? '/' : 'http://localhost:8080/',

        filename: isProd ? '[name].[hash].js' : '[name].bundle.js',

        chunkFilename: isProd ? '[name].[hash].js' : '[name].bundle.js'
    };
    if (isTest) {
        config.devtool = 'inline-source-map';
    } else if (isProd) {
        config.devtool = 'source-map';
    } else {
        config.devtool = 'eval-source-map';
    }

    config.module = {
        preLoaders: [],
        loaders: [{
            test: /\.js$/,
            loader: 'babel',
            exclude: /node_modules/
        }, {
            test: /\.css/,
            loader: isTest ? 'null' : ExtractTextWebpackPlugin.extract('style', 'css?sourceMap!postcss')
        }, {
            test: /\.(png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/,
            loader: 'file'
        }, {
            test: /\.json$/,
            loader: 'json'
        }, {
            test: /\.scss/,
            loader: 'style!css!sass'
        }, {
            test: /\.html$/,
            loader: 'raw'
        }]
    };
    if (isTest) {
        config.module.preLoaders.push({
            test: /\.js$/,
            exclude: [
                /node_modules/,
                /\.spec\.js$/
            ],
            loader: 'isparta-instrumenter'
        })
    }
    config.postcss = [
        autoprefixer({
            browsers: ['last 2 version']
        })
    ];
    config.plugins = [];
    if (!isTest) {
        config.plugins.push(
            new HtmlWebpackPlugin({
                template: './src/public/index.html',
                inject: 'body'
            }),

            new ExtractTextWebpackPlugin('[name].[hash].css', {disable: !isProd})
        )
    }
    if (isProd) {
        config.plugins.push(
            new webpack.NoErrorsPlugin(),

            new webpack.optimize.DedupePlugin(),

            new webpack.optimize.UglifyJsPlugin(),

            new CopyWebpackPlugin([{
                from: __dirname + '/src/public'
            }]),
            new webpack.ProvidePlugin({
                $: "jquery",
                jQuery: "jquery",
                "window.jQuery": "jquery"
            }))
    }
    config.devServer = {
        contentBase: './src/public',
        stats: 'minimal'
    };
    return config;
}();
