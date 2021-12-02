export const configurationObjectJsonTemplate = {
  uri: "*",
  name: "*",
  definitionUri: "",
  version: ""
};

export const configurationObjectRequiredKeys = ['uri', 'name'];

export enum MFChromeExtensionActions {
  PopupOpened = 'mf-ext-popup-opened',
  ConfigurationObjectsUpdated = 'mf-ext-configuration-objects-updated',
  AddConfigurationObject = 'mf-ext-add-configuration-object',
  UpdateConfigurationObject = 'mf-ext-update-configuration-object',
  ViewConfigurationObjects = 'mf-ext-view-configuration-objects'
}
