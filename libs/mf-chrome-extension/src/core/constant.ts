export const configurationObjectJsonTemplate = {
  uri: "*",
  name: "*",
  definitionUri: "",
  version: ""
};

export const configurationObjectRequiredKeys = ['uri', 'name'];

export enum MFChromeExtensionActions {
  PopupOpened = 'mf-ext-popup-opened',
  AddConfigurationObject = 'mf-ext-add-configuration-object',
  UpdateConfigurationObject = 'mf-ext-update-configuration-object',
  ViewConfigurationObjects = 'mf-ext-view-configuration-objects'
}
