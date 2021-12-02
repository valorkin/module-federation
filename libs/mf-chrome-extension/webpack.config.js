const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const sveltePreprocess = require("svelte-preprocess");

const outputDir = path.resolve(__dirname, '../../dist/libs/mf-chrome-extension');

module.exports = {
  entry: {
    popup: './src/main.ts',
    content: './src/content.ts',
    styles: [
      './src/assets/styles/index.scss'
    ]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.svelte$/,
        use: {
          loader: 'svelte-loader',
          options: {
            emitCss: true,
            preprocess: sveltePreprocess({})
          }
        }
      },
      {
        test: /node_modules\/svelte\/.*\.mjs$/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader',
          'sass-loader'
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader
          },
          'css-loader'
        ]
      }
    ],
  },
  resolve: {
    alias: {
      // Note: Later in this config file, we'll automatically add paths from `tsconfig.compilerOptions.paths`
      svelte: path.resolve('node_modules', 'svelte')
    },
    extensions: ['.mjs', '.js', '.ts', '.svelte'],
    mainFields: ['svelte', 'browser', 'module', 'main']
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
          from: path.resolve(__dirname, 'src/assets/images'),
          to: path.resolve(__dirname, `${outputDir}/assets/images`)
        }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css'
    })
  ]
};
