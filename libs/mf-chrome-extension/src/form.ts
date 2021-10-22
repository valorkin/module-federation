import { ConfigurationObject } from "@mf/core";

export const formElements = {
  text: document.getElementById('mfTextField') as HTMLInputElement,
  clearButton: document.getElementById('mfClearButton') as HTMLInputElement,
  submitButton: document.getElementById('mfSubmitButton') as HTMLInputElement,
  error: document.getElementById('mfErrorText')
};

export function disableSubmitButton() {
  formElements.submitButton.disabled = true;
}

export function enableSubmitButton() {
  formElements.submitButton.disabled = false;
}

export function refreshForm(value: ConfigurationObject) {
  formElements.text.value = JSON.stringify(value, undefined, 2);
  hideError();
  disableSubmitButton();
}

export function showError(error) {
  formElements.error.textContent = error.message;
  formElements.error.style.display = 'block';
}

export function hideError() {
  formElements.error.textContent = '';
  formElements.error.style.display = 'none';
}
