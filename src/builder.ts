import { BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';

import { mergeDeep, traverse } from './object.util';
import { readFileAsJson, writeFileAsJson } from './file.util';
import { BuilderOptions, JsonObjectMaps } from './builder.interface';

const srcPattern = /^src$|^src\/|^\/src\/|^\.\/src\//;
const fileExtensionsPattern = /\.js$|\.ts$|\.json$|\.html$/;

const prepandRootPath = (path: string, rootPath: string): string => {
  const cleanPath = path.replace(/^\.\/|^\//, '');
  return `${rootPath}/${cleanPath}`;
}

const overrideLocalToRootPaths = (localProjectAngularJson: JsonObject, localRootPath: string) => {
  traverse(localProjectAngularJson, (pathKey: string, path: any, nestedProperty: any) => {
    if (typeof path !== 'string') {
      return;
    }

    if (srcPattern.test(path)) {
      nestedProperty[pathKey] = prepandRootPath(path, localRootPath);
      return;
    }

    if (fileExtensionsPattern.test(path)) {
      nestedProperty[pathKey] = prepandRootPath(path, localRootPath);
    }
  });
}

function builder(options: BuilderOptions) {
  return new Promise<BuilderOutput>(async (resolve, reject) => {
    console.log(`Expanding project: '${options.project}'`);

    const rootAngularJsonPath = 'angular.json';
    const rootAngularJson = await readFileAsJson(rootAngularJsonPath)
      .catch(error => reject(error)) as JsonObjectMaps;

    const rootProjectAngularJson = rootAngularJson.projects[options.project] as JsonObject;

    const localRootPath = `${rootAngularJson.newProjectRoot}/${options.project}`;
    const localAngularJsonPath = `${localRootPath}/${rootAngularJsonPath}`;
    const localAngularJson = await readFileAsJson(localAngularJsonPath)
      .catch(error => reject(error)) as JsonObjectMaps;

    const localProjectAngularJson = localAngularJson.projects[options.project] as JsonObject;

    overrideLocalToRootPaths(localProjectAngularJson, localRootPath);

    rootAngularJson.projects[options.project] = mergeDeep(localProjectAngularJson, rootProjectAngularJson);

    writeFileAsJson(rootAngularJsonPath, rootAngularJson)
      .then(() => resolve({ success: true }))
      .catch(error => reject(error));
  });
};

export default createBuilder(builder);

