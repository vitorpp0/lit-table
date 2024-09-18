const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const htmlPlugin = new HtmlWebpackPlugin(
    title="This is a title",
    template="./src/index.html"
);

module.exports = {
  entry: './src/index.ts',
  watch: true,
  mode:"development",
  devtool: 'inline-source-map',
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  module:{
    rules:[
        {
            test: /\.(?:js|mjs|cjs)$/,
            exclude: /node_modules/,
            use: {
              loader: 'babel-loader',
              options: {
                presets: [
                  ['@babel/preset-env', { targets: "defaults" }]
                ]
              }
            }
        },
        {
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },
        {
          test: /\.(s?)css$/,
          use: [
            {loader: "to-string-loader"}, 
            {loader: "css-loader"},
            {loader: "sass-loader"}
          ],
        }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', ".scss", "css"],
  },
  plugins: [htmlPlugin]
};