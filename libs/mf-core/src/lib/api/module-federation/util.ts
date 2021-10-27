/**
 * Trims string values of an object
 */
export function trimObjectStringValues(object: any): any {
  const newObject = {...object};

  Object.keys(newObject).forEach((key) => {
    const value = newObject[key];

    if (typeof value === 'string') {
      newObject[key] = value.trim();
    }
  });

  return newObject;
};

/**
 * Foreach like fn that iterates an array backwards
 */
export function findIndexFromEnd<Type>(array: Type[], fn: (value: Type) => {}): number {
  if (!Array.isArray(array) || typeof fn !== 'function') {
    return -1;
  }

  for (let i = array.length - 1; i >= 0; i--) {
    if (fn(array[i])) {
      return i;
    }
  }

  return -1;
}

/**
 * Generates universally unique identifiers (version 4) to distinguish objects in the lists
 */
export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Sends GET reuest by a provided uri
 * Reusable window.fetch eror handler
 */
export async function fetchByUri(uri: string): Promise<Response> {
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
