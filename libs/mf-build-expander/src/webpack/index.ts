import { WebpackPluginInstance, Compiler } from 'webpack';
import { IPluginsJsonGeneratorOptions, executePlugin} from './plugin';

const pluginName = 'PluginsJsonGeneratorPlugin';

export class PluginsJsonGeneratorPlugin implements WebpackPluginInstance {
  constructor(public options: IPluginsJsonGeneratorOptions) {}

  public apply(compiler: Compiler) {
    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      const options = {
        ...this.options,
        webpackOptions: compilation.options
      };

      executePlugin(options);
    });
  }
}
