export function trimObjectStringProperties(object: any): any {
  const newObject = {...object};

  Object
    .keys(newObject)
    .forEach((key) => {
      const value = newObject[key];

      if (typeof value === 'string') {
        newObject[key] =  value.trim();
      }
    });

  return newObject;
}