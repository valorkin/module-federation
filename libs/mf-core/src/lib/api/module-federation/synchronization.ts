import { ConfigurationObject, RemoteContainerConfiguration } from './interface';

const mfCOsLocalStorageKey = 'mfCOs';
const mfRCCsLocalStorageKey = 'mfRCCs';

/**
 *
 */
function synchronizeConfigurationObjects(): void {
  const cos = window.mfCOs.map((co) => {
    return {
      uri: co.uri,
      uuid: co.uuid,
      name: co.name,
      active: co.active,
      hasError: false,
      status: null,
      definitionUri: co.definitionUri,
      version: co.version
    };
  });

  const jsonStringCOs = JSON.stringify(cos);
  window.localStorage.setItem(mfCOsLocalStorageKey, jsonStringCOs);
}

/**
 *
 */
 function synchronizeRemoteContainerConfigurations(): void {
  const rrcs = window._mfRCCs.map((rcc) => {
    return {
      uri: rcc.uri,
      uuid: rcc.uuid,
      name: rcc.name,
      version: rcc.version,
      provider: rcc.provider,
      issues: rcc.issues,
      modules: rcc.modules
    };
  });

  const jsonStringRCCs = JSON.stringify(rrcs);
  window.localStorage.setItem(mfRCCsLocalStorageKey, jsonStringRCCs);
}

/**
 *
 */
export function getSynchronizedConfigurationObjects(): ConfigurationObject[] {
  const jsonStringCOs = window.localStorage.getItem(mfCOsLocalStorageKey);

  if (!jsonStringCOs) {
    return [];
  }

  return JSON.parse(jsonStringCOs);
}

/**
 *
 */
 export function getSynchronizedRemoteContainerConfigurations(): RemoteContainerConfiguration[] {
  const jsonStringRCCs = window.localStorage.getItem(mfRCCsLocalStorageKey);

  if (!jsonStringRCCs) {
    return [];
  }

  return JSON.parse(jsonStringRCCs);
}

/**
 *
 */
 export function synchronize(): void {
  synchronizeConfigurationObjects();
  synchronizeRemoteContainerConfigurations();
}

/**
 *
 */
export function isSynchronized(): boolean {
  const jsonStringCOs = window.localStorage.getItem(mfCOsLocalStorageKey);

  if (!jsonStringCOs) {
    return false;
  }

  return jsonStringCOs.trim() !== '';
}
