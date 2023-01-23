const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {

  entry: './src/index.ts',
  output: {
    filename: 'script.js',
    path: path.resolve(__dirname, 'dist'),
  },
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,

      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

    plugins: [        
      new HtmlWebpackPlugin({
      template: './src/index.html',
      scriptLoading: "blocking",
  }),],
    devServer: {
        port: 4000
    }
}