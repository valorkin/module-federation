export const configurationObjectJsonTemplate = {
  uri: "*",
  name: "*",
  definitionUri: "",
  version: ""
};

export const configurationObjectRequiredKeys = ['uri', 'name'];

export enum MFChromeExtensionActions {
  AddFormConfigurationObject = 'mf-ext-add-form-configuration-object',
  AddFormConfigurationObjectSuccess = 'mf-ext-add-configuration-object-success'
}
