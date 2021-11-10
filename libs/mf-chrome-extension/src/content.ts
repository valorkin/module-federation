import { MFChromeExtensionActions } from './core/constant';

const actions = Object.keys(MFChromeExtensionActions)
  .map((key) => MFChromeExtensionActions[key]);

/**
 * Listens events from the popup script and redirects them to the web page's window object
 */
chrome.runtime.onMessage.addListener((payload: any) => {
  if (actions.includes(payload.action)) {
    dispatchWindowEvent(payload.action, payload.payload);
  }

  return true;
});

/**
 * Listens events from the web page's window object and redirects them to the popup script
 */
window.addEventListener('message', (event) => {
  if (actions.includes(event.data.action)) {
    dispatchRuntimeEvent(event.data);
  }
}, false);

/**
 * Triggers events to the web page's window object
 */
function dispatchWindowEvent(action: MFChromeExtensionActions, payload: any) {
  const event = new CustomEvent(
    action,
    {
      detail: {
        extensionId: chrome.runtime.id,
        payload
      }
    }
  );

  window.dispatchEvent(event);
}

/**
 *
 */
function dispatchRuntimeEvent(payload: any) {
  chrome.runtime.sendMessage({
    action: payload.action,
    payload: payload.payload
  });
}
