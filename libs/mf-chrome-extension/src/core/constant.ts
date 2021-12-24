export const configurationObjectJsonTemplate = {
  uri: "*",
  name: "*",
  definitionUri: "",
  version: ""
};

export const configurationObjectRequiredKeys = ['uri', 'name'];

export enum MFChromeExtensionActions {
  TogglePopup = 'mf-ext-toggle-popup',
  ClosePopup = 'mf-ext-close-popup',
  PopupOpened = 'mf-ext-popup-opened',
  ConfigurationObjectUpdated = 'mf-ext-configuration-object-updated',
  ConfigurationObjectsUpdated = 'mf-ext-configuration-objects-updated',
  AddConfigurationObject = 'mf-ext-add-configuration-object',
  UpdateConfigurationObject = 'mf-ext-update-configuration-object'
}
