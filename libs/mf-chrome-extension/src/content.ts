import { ConfigurationObject } from '@mf/core';
import { MFChromeExtensionActions } from './constant';

/**
 * Listens the event from the popup script
 */
chrome.runtime.onMessage.addListener((payload: any) => {
  if (payload.action === MFChromeExtensionActions.AddFormConfigurationObject) {
    dispatchAddConfigurationEvent(payload.payload);
  }

  return true;
});

/**
 * Triggers the add CO event to the client page's window object
 */
function dispatchAddConfigurationEvent(json: ConfigurationObject) {
  const event = new CustomEvent(
    MFChromeExtensionActions.AddFormConfigurationObject,
    { detail: json }
  );

  window.dispatchEvent(event);
}
