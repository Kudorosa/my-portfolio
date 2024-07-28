// Standard Build Process that will be shared between the Development and Build. 
// We're going to have two different types of Builds => Development and Build.

// The Build Scripts for the Application. 
const path = require("path") // Checks the path of your application and appends it to the Node Script Command. 
const webpack = require("webpack") // Webpack is only available on the Developmet side / It's not downloaded for the End-user.

const CopyWebpackPlugin = require("copy-webpack-plugin") // It's going to copy files from one place to another.
// Prevents having to do > <meta rel="icon" type ="image/png" sizes="32x32" href="assets/images/favicon-32x32.png">

const MiniCssExtractPlugin = require("mini-css-extract-plugin") // Fetches CSS Files from JS Files and outputs CSS to you.
// We will utilise Loaders for CSS and SASS.

const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin")
const { CleanWebpackPlugin } = require("clean-webpack-plugin") // Cleans the Public Folder
const TerserPlugin = require("terser-webpack-plugin")

const IS_DEVELOPMENT = process.env.NODE_ENV === "dev" //Checks from NODE.js which version we're running 

const dirApp = path.join(__dirname, "app") // Displays the path of your computer
const dirShared = path.join(__dirname, "shared")
const dirStyles = path.join(__dirname, "styles")
const dirNode = "node_modules"

module.exports = { // Exports different functions and objects from a file to others
    entry: [ // Entry point of the file. 
        path.join(dirApp, "index.js"),
        path.join(dirStyles, "index.scss"),
    ],

    resolve: { // Resolve allows the accessing of items that are deeply nested
        modules: [
            dirApp,
            dirShared,
            dirStyles,
            dirNode
        ],

        fallback: {
            fs: false
        }
    },

    optimization: {
        minimizer: [
            new ImageMinimizerPlugin({
                minimizer: {
                    // Lossless optimisation with custom option
                    // Fee; free to experiment with options for better result for you
                    implementation: ImageMinimizerPlugin.imageminMinify,
                    options: {
                        plugins: [
                            "imagemin-gifsicle",
                            "imagemin-mozjpeg",
                            "imagemin-pngquant",
                            "imagemin-svgo",
                        ],
                    },
                },
            }),
        ],
    },

    plugins: [
        new webpack.DefinePlugin({
            IS_DEVELOPMENT // Allows custom commands that are only available on Development side.
        }),

        new CopyWebpackPlugin({
            patterns: [
                {
                    from: "./shared",
                    to: "" // Output everything to the Shared Folder.
                }
            ]
        }),

        new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),

        new CleanWebpackPlugin()


    ],

    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader' // Babel is the compiler of JS, shows browser compatiable code / Compiles JS files automatically
                },
            },

            {
                test: /\.scss$/,
                use: [
                    {
                        loader: MiniCssExtractPlugin.loader,
                        options: {
                            publicPath: "" // Outputted in the Root of the Public Folder.
                        }
                    },

                    {
                        loader: "css-loader", // For including CSS and JS files 
                    },

                    {
                        loader: "postcss-loader", // Prevent extra typing of code
                    },

                    {
                        loader: "sass-loader"
                    },
                ]
            },

            {
                test: /\.(jpe?g|png|gif|svg|woff2|fnt|webp)$/,
                loader: "file-loader",
                options: {
                    name(file) {
                        return "[hash].[ext]"
                    }
                }
            },

            {
                test: /\.(jpe?g|png|gif|svg|webp)$/i,
                use: [
                    {
                        loader: ImageMinimizerPlugin.loader,
                    }
                ]
            },

            {
                test: /\.(glsl|frag|vert)$/, // Shader Extensions, mainly for WEBGL
                loader: "raw-loader",
                exclude: /node_modules/
            },

            {
                test: /\.(glsl|frag|vert)$/,
                loader: 'glslify-loader',
                exclude: /node_modules/
            }
        ]
    },

    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
}