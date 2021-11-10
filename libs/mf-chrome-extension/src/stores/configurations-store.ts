import { writable } from 'svelte/store';
import { ConfigurationObject } from '@mf/core';
import { MFChromeExtensionActions } from '../core/constant';

export const configurations = writable<ConfigurationObject[]>([]);

/**
 *
 */
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === MFChromeExtensionActions.UpdateConfigurationObject) {
    configurations.set(message.payload);
  }
});
