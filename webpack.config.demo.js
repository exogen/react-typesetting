const path = require('path')
const webpack = require('webpack')

module.exports = env => ({
  context: __dirname,
  entry: (env.development ? ['react-hot-loader/patch'] : []).concat([
    './demo/index.js'
  ]),
  output: {
    filename: 'demo.js',
    path: path.join(__dirname, 'docs/dist'),
    publicPath: '/dist/'
  },
  devServer: {
    contentBase: path.join(__dirname, 'docs'),
    compress: true,
    publicPath: '/dist/',
    hot: true,
    watchContentBase: true,
    overlay: {
      warnings: true,
      errors: true
    }
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      }
    ]
  },
  plugins: (env.development
    ? [
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NamedModulesPlugin()
    ]
    : []).concat([])
})
