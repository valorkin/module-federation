import {
  getSynchronizedConfigurationObjects,
  getSynchronizedRemoteContainerConfigurations
} from './synchronization';

import { ConfigurationObject, RemoteContainerConfiguration } from './interface';
import { MFCoreHooks } from './hooks';
import './hooks';


declare global {
  interface Window {
    mfCore: MFCoreHooks;
    mfCOs: ConfigurationObject[];
    _mfRCCs: RemoteContainerConfiguration[];
  }
}

window.mfCOs = getSynchronizedConfigurationObjects();
window._mfRCCs = getSynchronizedRemoteContainerConfigurations();

export * from './interface';
export * from './type';
export * from './util';
export * from './synchronization';
export * from './module-federation';
