import { ConfigurationObject, RemoteContainerConfiguration } from './interface';

declare global {
  interface Window {
    mfCOs: ConfigurationObject[];
    _mfRCCs: RemoteContainerConfiguration[];
  }
}

window.mfCOs = window.mfCOs || [];
window._mfRCCs = window._mfRCCs || [];

export * from './interface';
export * from './type';
export * from './module-federation';