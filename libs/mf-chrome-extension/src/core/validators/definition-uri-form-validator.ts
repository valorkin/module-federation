import { RemoteContainerConfiguration, fetchByUri } from '@mf/core';

/**
 *
 */
export async function testDefinitionUriForm(uri: string): Promise<string> {
  const isDefinitionUriValid = typeof uri === 'string' && uri.trim() !== '';

  if (!isDefinitionUriValid) {
    return Promise.reject(
      new Error(
        `TestValidationError: Definition URI has a wrong value`
      )
    );
  }

  let containers: RemoteContainerConfiguration[];

  try {
    containers = await fetchByUri(uri)
      .then((response) => {
        return response.json();
      });
  } catch (e) {
    return Promise.reject(
      new Error(
        `TestValidationError: Definition URI cannot be loaded`
      )
    );
  }

  if (!Array.isArray(containers) || containers.length < 1) {
    return Promise.reject(
      new Error(
        `TestValidationError: Definition URI has a wrong value`
      )
    );
  }

  return `TestValidationSuccess: Definition URI looks good`;
}
