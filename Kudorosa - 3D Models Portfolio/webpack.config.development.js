const { merge } = require("webpack-merge") // Copies everything from Build and puts it here as an Object
const path = require("path")

const config = require("./webpack.config")

module.exports = merge(config, { // Setups the Nodes of the Webpack 
    mode: "development",

    devtool: "inline-source-map", // Helps in inspecting the HTML

    devServer: {
        devMiddleware: {
            writeToDisk: true
        }
    },

    output: {
        path: path.resolve(__dirname, "public"),
        assetModuleFilename: '[name][ext]',
        clean: true,
    }
})
