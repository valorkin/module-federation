import { ConfigurationObject } from '@mf/core';
import { configurationObjectJsonTemplate, MFChromeExtensionActions } from './constant';

import {
  formElements,
  disableSubmitButton,
  enableSubmitButton,
  refreshForm,
  showError,
  hideError,
} from './form';

import { parseForm } from './form-validation';

refreshForm(configurationObjectJsonTemplate);

/**
 * Form listener to check its state
 */
formElements.text.addEventListener('keyup', () => {
  const validation = parseForm(formElements.text.value);

  if (validation instanceof Error) {
    showError(validation);
    disableSubmitButton();
    return;
  }

  hideError();
  enableSubmitButton();
});

/**
 *
 */
formElements.clearButton.addEventListener('click', () => {
  refreshForm(configurationObjectJsonTemplate);
});

/**
 *
 */
formElements.submitButton.addEventListener('click', () => {
  const json = parseForm(formElements.text.value);

  if (json instanceof Error) {
    return;
  }

  refreshForm(configurationObjectJsonTemplate);
  sendMessage(json);
});

/**
 * Sends the json object to the content script
 */
function sendMessage(payload: ConfigurationObject) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(
      tabs[0].id,
      {
        action: MFChromeExtensionActions.AddFormConfigurationObject,
        payload
      }
    );
  });
}


