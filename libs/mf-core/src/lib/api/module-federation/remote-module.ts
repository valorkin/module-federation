import {
  ModuleFederationСontainer,
  ConfigurationObject,
  NgRemoteContainerConfigurationModule,
  RemoteContainerConfigurationModule
} from './interface';

import { loadRemoteEntryJs } from './remote-entry';

declare const __webpack_init_sharing__: (shareScope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: string };

/**
 * Rejects with the error object
 */
function rejectWithResolvingError(name: string, moduleName: string) {
  return Promise.reject(
    new Error(
      `RemoteModuleResolvingError: Can't resolve ${moduleName} module`
    )
  );
}

/**
 * Removes webpack's previous module resolution
 */
function unresolveRemoteModule(name: string) {
  window[name] = null;
  window[`webpackChunk${name}`] = null;
}

/**
 * Checks if a remote module is resolved
 */
function hasRemoteModuleBeenResolved(container: ModuleFederationСontainer): boolean {
  return Object.prototype.toString.call(container) === '[object Object]';
}

/**
 * Resolves a remote module by using Webpack Module Federation API
 */
async function resolveRemoteModule<T>(name: string, module: string): Promise<T> {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__('default');

  const container = window[name] as ModuleFederationСontainer; // or get the container somewhere else

  if (!hasRemoteModuleBeenResolved(container)) {
    return rejectWithResolvingError(name, module);
  }

  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default);

  let factory;

  try {
    factory = await container.get(module);
  } catch {
    return rejectWithResolvingError(name, module);
  }

  // if var factory is not a function we have a trouble with a provided module
  if (typeof factory !== 'function') {
    return rejectWithResolvingError(name, module);
  }

  return factory() as T;
}

/**
 * Loads the remote entry file and resolves a remote module
 */
export async function createRemoteModuleAsync<T = any>(configurationObject: ConfigurationObject, module: RemoteContainerConfigurationModule) {
  const { name } = configurationObject;

  // if a module is defined with a same name we should flush it to replace with a new one
  if (hasRemoteModuleBeenResolved(window[name])) {
    unresolveRemoteModule(name);
  }

  await loadRemoteEntryJs(configurationObject.uri);
  return await resolveRemoteModule<T>(name, (module as NgRemoteContainerConfigurationModule).exposedModule);
}
