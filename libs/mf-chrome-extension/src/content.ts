import { MFChromeExtensionActions } from './constant';

chrome.runtime.onMessage.addListener((payload: any) => {
  if (payload.action === MFChromeExtensionActions.AddFormConfigurationObject) {
    console.log(payload.payload)
  }

  return true;
});
