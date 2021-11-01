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

window.mfCOs = window.mfCOs || [];
window._mfRCCs = window._mfRCCs || [];

export * from './interface';
export * from './type';
export * from './util';
export * from './module-federation';
