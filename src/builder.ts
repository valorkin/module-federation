import { BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';

import { mergeDeep, traverse } from './object.util';
import { readFileAsJson, writeFileAsJson } from './file.util';
import { BuilderOptions, JsonObjectMaps } from './builder.interface';

/**
 * Helper function
 */
const prepandRootPath = (path: string, rootPath: string): string => {
  const cleanPath = path.replace(/^\.\/|^\//, '');
  return `${rootPath}/${cleanPath}`;
}

/**
 * Helper function
 */
const overrideLocalToRootPaths = (localProjectAngularJson: JsonObject, localRootPath: string) => {
  // Regexp pattern to define source paths `src/*`
  const srcPattern = /^src$|^src\/|^\/src\/|^\.\/src\//;
  // Regexp pattern to define file paths such as `tsconfig.app.json`
  const fileExtensionsPattern = /\.[^/.]+$/;

  traverse(localProjectAngularJson, (targetPropertyKey: string, path: any, targetProperty: any) => {
    if (typeof path !== 'string') {
      return;
    }

    if (srcPattern.test(path)) {
      targetProperty[targetPropertyKey] = prepandRootPath(path, localRootPath);
      return;
    }

    if (fileExtensionsPattern.test(path)) {
      targetProperty[targetPropertyKey] = prepandRootPath(path, localRootPath);
    }
  });
}

/**
 * Builder implementation
 */
function builder(options: BuilderOptions) {
  return new Promise<BuilderOutput>(async (resolve, reject) => {
    console.log(`Expanding '${options.project}' project...`);

    // getting root `angular.json`
    const rootAngularJsonPath = 'angular.json';
    const rootAngularJson = await readFileAsJson(rootAngularJsonPath)
      .catch(error => reject(error)) as JsonObjectMaps;

    // getting local project's config from root `angular.json`
    const rootProjectAngularJson = rootAngularJson.projects[options.project] as JsonObject;

    // getting local project's `projects/project/angular.json`
    const localRootPath = `${rootAngularJson.newProjectRoot}/${options.project}`;
    const localAngularJsonPath = `${localRootPath}/${rootAngularJsonPath}`;
    const localAngularJson = await readFileAsJson(localAngularJsonPath)
      .catch(error => reject(error)) as JsonObjectMaps;

    // getting local project's config from local `projects/project/angular.json`
    const localProjectAngularJson = localAngularJson.projects[options.project] as JsonObject;

    // overriding local paths `src/` into root paths `projects/project/src`
    // overriding path to files `tsconfig.app.json` into root paths `projects/project/tsconfig.app.json`
    overrideLocalToRootPaths(localProjectAngularJson, localRootPath);

    // merging local `projects/project/angular.json` into root `angular.json`
    rootAngularJson.projects[options.project] = mergeDeep(localProjectAngularJson, rootProjectAngularJson);

    writeFileAsJson(rootAngularJsonPath, rootAngularJson)
      .then(() => {
        console.log(`Expanding of '${options.project}' project has successfully finished.`)
        resolve({ success: true });
      })
      .catch(error => reject(error));
  });
};

export default createBuilder(builder);

