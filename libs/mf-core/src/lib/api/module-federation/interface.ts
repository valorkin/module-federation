export interface ConfigurationObject {
  uri: string, // URI of remote entry.js
  uuid?: string;
  name?: string,
  active?: boolean,
  hasError?: boolean;
  status?: Promise<any>,
  definitionUri?: string,
  version?: string
}

export interface ConfigurationObjectResolve {
  module: any;
  configuration: RemoteContainerConfiguration;
  configurationModule: RemoteContainerConfigurationModule
}

export interface RemoteContainerConfiguration {
  uri: string,   // URI of remote entry.js
  uuid?: string;
  name?: string,
  version?: string,
  provider?: string;
  issues?: string;
  modules?: RemoteContainerConfigurationModule[]
}

export type RemoteContainerConfigurationModule = NgRemoteContainerConfigurationModule
  | IframeRemoteContainerConfigurationModule
  | CustomElementRemoteContainerConfigurationModule;

export interface NgRemoteContainerConfigurationModule {
  /** Uniq name of module in plugin */
  name: string;
  /** Component name we are planning to inject */
  component?: string;
  /** Type of a plugin module */
  type: 'angular-ivy-component';
  /** Exposed Angular Module */
  exposedModule: string;
  /** most likely this property will be removed, but as for this this is a way to register route for a component*/
  route?: string;
}

export interface IframeRemoteContainerConfigurationModule {
  /** Uniq name of module in plugin */
  name: string;
  /** Type of a plugin module */
  type: 'iframe';
  /** link to html relative to URI, where uri+html should give a valid URL */
  html: string
}

export interface CustomElementRemoteContainerConfigurationModule {
  /** name */
  name: string;
  /** Type of a plugin module */
  type: 'custom-element';
  /** Exposed Angular Module */
  exposedModule: string;
  /** Component name we are planning to inject */
  componentName: string;
}

export interface ModuleFederationСontainer {
  init(shareScope: string): void;
  get(module: string): () => any;
}
