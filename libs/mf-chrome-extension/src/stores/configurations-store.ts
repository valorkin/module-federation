import { writable } from 'svelte/store';
import { ConfigurationObject } from '@mf/core';
import { MFChromeExtensionActions } from '../core/constant';
import { groupBy } from '../core/utils';

export const configurations = writable<ConfigurationObject[]>([]);

/**
 *
 */
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === MFChromeExtensionActions.ConfigurationObjectsUpdated) {
    configurations.set(
      serializeConfigurations(message.payload)
    );
  }
});

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
