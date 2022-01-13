import { ConfigurationObject, RemoteContainerConfiguration, fetchByUri } from '@mf/core';
import { testDefinitionUriForm } from './definition-uri-form-validator';

/**
 *
 */
export async function testForm(json: ConfigurationObject): Promise<string> {
  let scriptText: string;

  try {
    scriptText = await fetchByUri(json.uri)
      .then((response) => {
        return response.text();
      });
  } catch (e) {
    return Promise.reject(
      new Error(
        `TestValidationError: Configuration Object cannot be loaded`
      )
    );
  }

  // check global var declaration `var containerName;`
  const isContainerValid = new RegExp(`var ${json.name};`, 'i')
    .test(scriptText);

  if (!isContainerValid) {
    return Promise.reject(
      new Error(
        `TestValidationError: Configuration Object cannot be resolved`
      )
    );
  }

  const { definitionUri } = json;

  if (definitionUri) {
    try {
      await testDefinitionUriForm(definitionUri);
    } catch (e) {
      return Promise.reject(e);
    }
  }

  return `TestValidationSuccess: Configuration Object looks good`;
}
