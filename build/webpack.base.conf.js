var path = require('path')
var ExtractTextPlugin = require("extract-text-webpack-plugin")
const pkg = require(path.join(__dirname, '../package.json'))
const config = require('../config')

module.exports = {
  entry: {
    app: path.resolve(__dirname, '../src/app/index.js')
  },
  output: {
    path: config.build.assetsRoot,
    filename: `${pkg.name}.js`
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          // 'style-loader',
          'css-loader'
        ],
      },
      {
        test: /\.less$/,
        use: [
          // 'style-loader',
          'css-loader',
          'less-loader'
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        use: [ {
          loader: 'html-loader',
          options: {
            minimize: true,
            collapseWhitespace: false
          }
        }],
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'url-loader',
        options: {
          name: '[name].[ext]?[hash]'
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'media/[name].[hash:7].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[hash:7].[ext]'
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json']
  },
  plugins: [
  ]
}
