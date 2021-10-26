import { ConfigurationObject } from "@mf/core";

export const formElements = {
  text: document.getElementById('mfTextField') as HTMLInputElement,
  clearButton: document.getElementById('mfClearButton') as HTMLInputElement,
  submitButton: document.getElementById('mfSubmitButton') as HTMLInputElement,
  testButton: document.getElementById('mfTestButton') as HTMLInputElement,
  message: document.getElementById('mfMessageText')
};

export function disableSubmitButton() {
  formElements.submitButton.disabled = true;
  formElements.testButton.disabled = true;
}

export function enableSubmitButton() {
  formElements.submitButton.disabled = false;
  formElements.testButton.disabled = false;
}

export function refreshForm(value: ConfigurationObject) {
  formElements.text.value = JSON.stringify(value, undefined, 2);
  hideMessage();
  disableSubmitButton();
}

export function showError(error: Error) {
  formElements.message.innerHTML = `
    <span class='mf-chrome-ext-form__message--error'>
      ${error.message}
    </span>`;

  formElements.message.style.display = 'block';
}

export function showSuccess(text: string) {
  formElements.message.innerHTML = `
    <span class='mf-chrome-ext-form__message--success'>
      ${text}
    </span>`;

  formElements.message.style.display = 'block';
}

export function hideMessage() {
  formElements.message.innerHTML = '';
  formElements.message.style.display = 'none';
}
