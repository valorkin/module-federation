import { JsonObject } from '@angular-devkit/core';
import { promises } from 'fs';

export const readFileAsJson = (path: string, format = 'utf8'): Promise<JsonObject> => {
  return new Promise(async (resolve, reject) => {
     try {
       const content = await promises.readFile(path, format) as string;
       resolve(JSON.parse(content));
     } catch (error) {
       reject(error)
     }
  });
}

export const writeFileAsJson = async (path: string, data: any, format = 'utf8'): Promise<void> => {
  try {
    return await promises.writeFile(path, JSON.stringify(data, null, 2), format);
  } catch (error) {
    return Promise.reject(error)
  }
}