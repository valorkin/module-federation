const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const outputDir = path.resolve(__dirname, '../../dist/mf-chrome-extension');

module.exports = {
  entry: {
    popup: './src/popup.ts',
    content: './src/content.ts',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: `${outputDir}/[name].css`
            }
          },
          'style-loader',
          'css-loader',
          {
						loader: 'sass-loader'
					},
        ]
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: '[name].js',
    path: outputDir,
    clean: true
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'src/popup.html')
        },
        {
          from: path.resolve(__dirname, 'manifest.json')
        },
        {
          from: path.resolve(__dirname, 'src/assets'),
          to: path.resolve(__dirname, `${outputDir}/assets`)
        }
      ]
    })
  ]
};
