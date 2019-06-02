const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const main = [
  __dirname + '/slidePage2.js',
]
if (process.argv[2] === '--ie') {
  main.unshift('@babel/polyfill')
}

module.exports = {
  mode: 'production',
  entry:{
    main: main
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
        test: /.ts$/,
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