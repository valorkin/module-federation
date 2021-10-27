import { ConfigurationObject, RemoteContainerConfiguration, fetchByUri } from "@mf/core";

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
  const isDefinitionUriValid = typeof definitionUri === 'string' && definitionUri.trim() !== '';

  if (isDefinitionUriValid) {
    let containers: RemoteContainerConfiguration[];

    try {
      containers = await fetchByUri(definitionUri)
        .then((response) => {
          return response.json();
        });
    } catch (e) {
      return Promise.reject(
        new Error(
          `TestValidationError: Container Definitions cannot be loaded`
        )
      );
    }

    if (!Array.isArray(containers) || containers.length < 1) {
      return Promise.reject(
        new Error(
          `TestValidationError: Container Definitions cannot be resolved`
        )
      );
    }
  }

  return `TestValidationSuccess: Configuration Object looks good`;
}
