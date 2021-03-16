import { WebpackPluginInstance, Compiler } from 'webpack';
import { IPluginsJsonGeneratorOptions, executePlugin} from './plugin';

export class PluginsJsonGeneratorPlugin implements WebpackPluginInstance {
  constructor(public options: IPluginsJsonGeneratorOptions) {}

  public apply(compiler: Compiler) {
    compiler.hooks.done.tap('PluginsJsonGeneratorPlugin', stats => {
      const options = {
        ...this.options,
        webpackOptions: stats.compilation.options
      };

      executePlugin(options);
    });
  }
}