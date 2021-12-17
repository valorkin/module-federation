import { writable } from 'svelte/store';
import { ConfigurationObject } from '@mf/core';
import { MFChromeExtensionActions } from '../core/constant';
import { groupBy } from '../core/utils';

export const configurations = writable<ConfigurationObject[]>([]);

window.addEventListener('message', (event) => {
  const { action, payload } = event.data;

  if (action === MFChromeExtensionActions.ConfigurationObjectsUpdated) {
    configurations.set(
      serializeConfigurations(payload)
    );
  }
}, false);

/**
 *
 */
function serializeConfigurations(cos: ConfigurationObject[]): ConfigurationObject[] {
  const groupedCOs = groupBy(cos, 'name');
  const result = [];

  for (let groups of Object.values<ConfigurationObject[]>(groupedCOs)) {
    groups.forEach((co) => result.push(co));
  }

  return result;
}
