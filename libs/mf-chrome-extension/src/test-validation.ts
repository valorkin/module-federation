import { ConfigurationObject } from "@mf/core";

/**
 *
 */
async function fetchByUri(uri: string): Promise<Response> {
  try {
    const response = await fetch(uri);

    if (!response.ok) {
      throw response;
    }

    return response;
  } catch (e) {
    return Promise.reject(e);
  }
}

/**
 *
 */
export async function testForm(json: ConfigurationObject): Promise<string> {
  let scriptText;

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

  // check `var containerName;`
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
    let containers;

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
