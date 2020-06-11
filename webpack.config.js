const path = require('path')

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  target: 'node',
  mode: isProd ? 'production' : 'development',
  entry: {
    jiti: './src/jiti.ts',
    babel: './src/babel.ts',
    v8cache: 'v8-compile-cache'
  },
  devtool: false,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'commonjs2',
    libraryExport: 'default'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@babel/code-frame': require.resolve('./stubs/babel_codeframe')
    }
  },
  stats: {
    // preset: 'detailed',
    warningsFilter: [/critical dependency:/i]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  node: false,
  optimization: {
    nodeEnv: false,
    moduleIds: 'named',
    chunkIds: 'named'
  }
}
