import { MFChromeExtensionActions } from './core/constant';

const outputActions = [
  MFChromeExtensionActions.PopupOpened,
  MFChromeExtensionActions.AddConfigurationObject,
  MFChromeExtensionActions.UpdateConfigurationObject
];

const popupId = 'mf-chrome-extension-popup';

/**
 * Listens 'TogglePopup' event from the background script
 */
chrome.runtime.onMessage.addListener((payload: any) => {
  if (payload.action === MFChromeExtensionActions.TogglePopup) {
    togglePopup();
  }

  return true;
});

/**
 *
 */
window.addEventListener('message', (event) => {
  const { action, payload } = event.data;
  console.log(event.data);

  if (outputActions.includes(action)) {
    dispatchEventToWindow(action, payload);
    return;
  }

  dispatchEventToPopup(event.data);
}, false);

/**
 *
 */
function getPopup(): HTMLIFrameElement {
  return document.getElementById(popupId) as HTMLIFrameElement;
}

/**
 *
 */
function dispatchEventToPopup(payload: any) {
  let popupElement = getPopup();
  popupElement?.contentWindow?.postMessage(payload, '*');
}

/**
 *
 */
 function dispatchEventToWindow(action: string, payload: any) {
  const customEvent = new CustomEvent(
    action,
    {
      detail: payload
    }
  );

  window.dispatchEvent(customEvent);
}

/**
 *
 */
function togglePopup() {
  let popupElement = getPopup();

  if (popupElement) {
    document.body.removeChild(popupElement);
    return;
  }

  popupElement = document.createElement('iframe');
  popupElement.id = popupId;
  popupElement.style.position = 'fixed';
  popupElement.style.zIndex = '99999999999999';
  popupElement.style.width = '740px';
  popupElement.style.height = '620px';
  popupElement.style.top = '0px';
  popupElement.style.right = '0px';
  popupElement.style.border = '0';
  popupElement.style.borderBottomLeftRadius = '5px';
  popupElement.style.borderTopLeftRadius = '5px';
  popupElement.src = chrome.runtime.getURL('popup.html');
  document.body.appendChild(popupElement);
}
