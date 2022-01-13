import { MFChromeExtensionActions } from './core/constant';

chrome.action.onClicked.addListener(() => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        action: MFChromeExtensionActions.TogglePopup
      }
    );
  })
});
