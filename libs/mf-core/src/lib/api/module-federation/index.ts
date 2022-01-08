import {
  getSynchronizedConfigurationObjects,
  getSynchronizedRemoteContainerConfigurations
} from './synchronization';

import { ConfigurationObject, RemoteContainerConfiguration } from './interface';

declare global {
  interface Window {
    mfCOs: ConfigurationObject[];
    _mfRCCs: RemoteContainerConfiguration[];
  }
}

window.mfCOs = getSynchronizedConfigurationObjects();
window._mfRCCs = getSynchronizedRemoteContainerConfigurations();

export * from './interface';
export * from './util';
export * from './synchronization';
export * from './configuration-object';
export * from './module-federation';
