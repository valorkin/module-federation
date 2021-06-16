import { ModuleFederationСontainer, ConfigurationObject } from './configuration.interface';
import { loadRemoteEntryJs } from './remote-entry';

declare const __webpack_init_sharing__: (shareScope: string) => Promise<void>;
declare const __webpack_share_scopes__: { default: string };

/**
 *
 */
const rejectWithResolvingError = (name: string, remoteModule: string) => {
  return Promise.reject(
    new Error(
      `ModuleExposedResolveError: Can't resolve module ${name} from exposed module ${remoteModule}`
    )
  );
}

/**
 *
 */
const resolveRemoteModule = async <T>(name: string, remoteModule: string): Promise<T> => {
  // Initializes the share scope. This fills it with known provided modules from this build and all remotes
  await __webpack_init_sharing__('default');

  const container = window[name] as ModuleFederationСontainer; // or get the container somewhere else

  // Check if a container is an object
  const isContainerDefined = Object.prototype.toString.call(container) === '[object Object]';

  if (!isContainerDefined) {
    return rejectWithResolvingError(name, remoteModule);
  }

  // Initialize the container, it may provide shared modules
  await container.init(__webpack_share_scopes__.default);

  let factory;

  try {
    factory = await container.get(remoteModule);
  } catch {
    return rejectWithResolvingError(name, remoteModule);
  }

  // if var factory is not a function we have a trouble with a provided module
  if (typeof factory !== 'function') {
    return rejectWithResolvingError(name, remoteModule);
  }

  return factory() as T;
}

/**
 *
 */
 export const createRemoteModuleAsync = async <T = any>(configurationObject: ConfigurationObject, module: string) => {
  await loadRemoteEntryJs(configurationObject.uri);
  return await resolveRemoteModule<T>(configurationObject.name, module);
}