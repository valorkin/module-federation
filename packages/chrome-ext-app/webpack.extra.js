const path = require('path');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const { PluginsJsonGeneratorPlugin } = require('@nowant/ng-build-expander/src/webpack');

const sharedDep = (name) => {
  return {
    [name]: {singleton: true}
  }
};

const name = 'contentRecommendedCategories';

module.exports = {
  output: {
    uniqueName: name
  },
  optimization: {
    runtimeChunk: false
  },
  plugins: [
    new ModuleFederationPlugin({
      name,
      library: {type: 'var', name},
      filename: 'remoteEntry.js',
      exposes: {
        './RecommendedCategories': './src/app/recommended-categories/recommended-categories.component.ts',
      },
      remotes: {
        chromeExtApp: 'contentRecommendedCategories@http://localhost:4207/remoteEntry.js'
      },
      shared: [
        sharedDep('@angular/core'),
        sharedDep('@angular/common'),
        sharedDep('@angular/router'),
        sharedDep('@fundamental-ngx/core'),
        sharedDep('@fundamental-ngx/app-shell')
      ],
    }),
    new PluginsJsonGeneratorPlugin({
      remotesDir: path.resolve(__dirname, '../'),
      filename: 'plugins.json',
      outputDir: path.resolve(__dirname, './src/assets/config')
    })
  ]
};


