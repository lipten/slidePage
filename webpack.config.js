const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  mode: 'production',
  entry:{
    slidePage: [
      __dirname + '/slidePage.js',
    ]
  },
  output:{
    path:__dirname + '/dist',
    filename:'[name].min.js',
    library: "slidePage",
    libraryTarget: "umd",
    libraryExport: "default",
  },
  module: {
    rules: [
      {
        test: /.js$/,
        use: [
          'babel-loader',
        ]
      }
    ]
  },
  plugins: [
    // new BundleAnalyzerPlugin()
  ]
}