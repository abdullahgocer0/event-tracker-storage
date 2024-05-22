const path = require('path');

module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'EventTracker',
    libraryTarget: 'umd',
    globalObject: 'this'
  },
  mode: 'production',
  devtool: 'source-map',
  resolve: {
    extensions: ['.ts', '.js'] // TypeScript ve JavaScript dosyalarını çözümlemek için
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: 'ts-loader' // TypeScript dosyalarını işlemek için ts-loader kullanın
      }
    ]
  }
};
