const path = require("path");

module.exports = {
    entry: "./src/utils-format.test.mjs",
    output: {
        "filename": "utils-format.test.js",
        "path": path.resolve(__dirname, "..", "public")
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.(png|svg|jpg|jpeg|gif)$/,
                type: 'asset/resource'
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                type: 'asset/resource'
            },
            {
                test: /\.csv$/,
                use: ['csv-loader']
            },
            {
                test: /\.xml$/,
                use: ['xml-loader']
            }
        ]
    },
    resolve: {
        fallback: {
            util: require.resolve("util/")
        }
    }
}