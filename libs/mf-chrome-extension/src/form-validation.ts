import { ConfigurationObject } from '@mf/core';
import {
  configurationObjectJsonTemplate,
  configurationObjectRequiredKeys
} from './constant';

/**
 * Сhecks if the json object matches the CO scheme
 */
function validateFormScheme(json: ConfigurationObject): boolean | Error {
  const keys = Object.keys(json);

  if (keys.length > 4 || keys.length < 2) {
    return new Error(`FormValidationError: Configuration Object should have 2 or 4 props`);
  }

  const unknownKeys = keys.some((key) => {
    return !configurationObjectJsonTemplate.hasOwnProperty(key);
  });

  if (unknownKeys) {
    return new Error(`FormValidationError: Configuration Object scheme is invalid`);
  }

  const missingRequiredKeys = configurationObjectRequiredKeys.some((key) => {
     return !json.hasOwnProperty(key)
  });

  if (missingRequiredKeys) {
    return new Error(`FormValidationError: 'uri' and 'name' props are required`);
  }

  return true;
}

/**
 * Сhecks if the json object has valid CO values
 */
function validateFormValues(json: ConfigurationObject) {
  for (let [key, value] of Object.entries(json)) {
    const isString = typeof value === 'string';

    if (!isString) {
      return new Error(`FormValidationError: Value of '${key}' should be string`);
    }

    const isRequiredKey = configurationObjectRequiredKeys.indexOf(key) > -1;
    const trimmedValue = value.trim();

    if (isRequiredKey && (trimmedValue === '' || trimmedValue === '*')) {
      return new Error(`FormValidationError: Value of required prop '${key}' is empty`);
    }
  }

  return true;
}

/**
 * Parses the json string to object then validates by the scheme and values
 */
export function parseForm(formJson: string): ConfigurationObject | Error {
  let json: ConfigurationObject;

  try {
    json = JSON.parse(formJson);
  } catch(e) {
    return new Error(`FormValidationError: Value can't be parsed as a json string: ${e.message}`);
  }

  const schemeValidation = validateFormScheme(json);

  if (schemeValidation instanceof Error) {
    return schemeValidation;
  }

  const valuesValidation = validateFormValues(json);

  if (valuesValidation instanceof Error) {
    return valuesValidation;
  }

  return json;
}
