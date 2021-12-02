import { resolve, join } from 'path';
import { promises } from 'fs';
import { WebpackOptionsNormalized } from 'webpack';
import { camelToUnderscore, readFileAsJson, writeFileAsJson } from '../utils';
import { AngularComponentParser, AngularModuleParser } from './angular.parser';
import { IParser } from './parsers';

export interface IPluginsJsonGeneratorOptions {
  remotesDir: string;
  outputDir: string;
  filename: string;
}

export interface IPluginsJsonGeneratorInternalOptions extends IPluginsJsonGeneratorOptions {
  webpackOptions: WebpackOptionsNormalized;
}

// Parser objects to get class names from specific files
const parsers: IParser[] = [
  AngularComponentParser,
  AngularModuleParser
];

/**
 * Reads a remote app's `package.json`
 */
const readPackageJson = async function(packageJsonPath: string): Promise<any> {
  return await readFileAsJson(packageJsonPath)
    .catch(() => {
      throw new Error(`PluginsJsonGeneratorPackageJsonError: ${packageJsonPath} is not found`);
    });
}

/**
 *
 */
const readWebpackModuleFederationPlugin = async (webpackKind: string | WebpackOptionsNormalized) => {
  const webpackConfig = typeof webpackKind === 'string'
    ? await import(webpackKind as string)
    : webpackKind;

  const moduleFederationPlugin = webpackConfig.plugins.find((plugin: FunctionConstructor) => {
    return plugin.constructor.name === 'ModuleFederationPlugin';
  });

  if (!moduleFederationPlugin) {
    throw new Error('PluginsJsonGeneratorWebpackError: ModuleFederationPlugin is not found');
  }

  return moduleFederationPlugin._options;
}

/**
 *
 */
const readExposedFile = async (filePath: string) => {
  return await promises.readFile(filePath, 'utf-8')
    .catch(() => {
      throw new Error(`PluginsJsonGeneratorExposedModuleError: Module '${filePath}' is not found`);
    });
}

/**
 *
 */
const readModuleDescriptors = async (rootAppDir: string): Promise<object[]> => {
  const webpackPath = resolve(rootAppDir, `./webpack.extra.js`);
  const remoteModuleFederationPlugin = await readWebpackModuleFederationPlugin(webpackPath);
  const remoteModuleFederationPluginExposes: {[key: string]: string} = remoteModuleFederationPlugin.exposes;
  const modules: object[] = [];

  for (let [exposedModule, exposedPath] of Object.entries(remoteModuleFederationPluginExposes)) {
    const exposedModulePath = resolve(rootAppDir, `./${exposedPath}`);
    const exposedModuleFile = await readExposedFile(exposedModulePath);

    parsers.forEach((parser) => {
      if (parser.validate(exposedModuleFile)) {
        const descriptors = parser.parse(exposedModuleFile);
        modules.push({exposedModule, ...descriptors});
      }
    });
  }

  return modules;
}

/**
 *
 */
const writeOutputFile = async (filePath: string, data: any) => {
  return await writeFileAsJson(filePath, data)
    .catch(() => {
      throw new Error(`PluginsJsonGeneratorOutputFileError: An error occurred with creating '${filePath}'`);
    });
}

/**
 *
 */
export const executePlugin = async (options: IPluginsJsonGeneratorInternalOptions): Promise<void> => {
  const moduleFederationPlugin = await readWebpackModuleFederationPlugin(options.webpackOptions);
  const moduleFederationPluginRemotes: {[key: string]: string} = moduleFederationPlugin.remotes;
  const descriptors: any[] = [];

  for (let [remoteName, remoteUrl] of Object.entries(moduleFederationPluginRemotes)) {
    const remoteAppName = camelToUnderscore(remoteName);
    const remotePackageJsonPath = resolve(options.remotesDir, `${remoteAppName}/package.json`);
    const remotePackageJson = await readPackageJson(remotePackageJsonPath);
    const remoteParts = remoteUrl.split('@');

    const descriptor: any = {
      name: remoteParts[0],
      version: remotePackageJson.version,
      uri: remoteParts[1],
      modules: []
    }

    const issues = remotePackageJson?.bugs ? remotePackageJson.bugs.url : null;

    if (issues) {
      descriptor.issues = issues;
    }

    const rootAppDir = resolve(options.remotesDir, `./${remoteAppName}/`);
    descriptor.modules = await readModuleDescriptors(rootAppDir);
    descriptors.push(descriptor);
  }

  const outputFilePath = join(options.outputDir, options.filename);
  return await writeOutputFile(outputFilePath, descriptors);
}
