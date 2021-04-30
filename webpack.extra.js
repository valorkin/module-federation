const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const sharedDep = (name) => {
  return {
    [name]: {singleton: true}
  }
};
const name = 'oneBxShellApp'
module.exports = {
  output: {
    uniqueName: name
  },
  optimization: {
    // Only needed to bypass a temporary bug
    runtimeChunk: false
  },
  plugins: [
    new ModuleFederationPlugin({
      name: name,
      library: {type: 'var', name: name},
      filename: 'remoteEntry.js',
      remotes: {
      },
      shared: [
        sharedDep('@angular/core'),
        sharedDep('@angular/common')
      ]
    })
  ]
};
