export function trimObjectStringValues(object: any): any {
  const newObject = {...object};

  Object
    .keys(newObject)
    .forEach((key) => {
      const value = newObject[key];

      if (typeof value === 'string') {
        newObject[key] = value.trim();
      }
    });

  return newObject;
};

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

export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
