import { BuilderOutput, createBuilder } from '@angular-devkit/architect';

import { mergeDeep, traverse } from './object.util';
import { readFileAsJson, writeFileAsJson } from './file.util';
import { BuilderOptions, JsonObjectMaps } from './builder.interface';

/**
 * Helper function
 */
const prepandRootPath = (path: string, rootPath: string): string => {
  // Regexp pattern to remove `./`, `../` or `/` chars from the path start
  const cleanPath = path.replace(/^\.[.]?\/|^\//, '');
  return `${rootPath}/${cleanPath}`;
}

/**
 * Helper function
 */
const createDirectoryPattern = (directory: string): RegExp => {
  return new RegExp(`^[.]?[/]?${directory}[/]?`);
}

/**
 * Helper function
 */
const overrideLocalInToRootPaths = (localProjectAngularJson: any, localRootPath: string): void => {
  // Regexp pattern to define dirs such as `src/*`, `dist/*`
  const directoryPatterns = ['src', 'dist']
    .map(directory => createDirectoryPattern(directory));

  // Regexp pattern to define file paths such as `tsconfig.app.json`
  const fileExtensionsPattern = /\.[^/.]+$/;

  // override local root path
  localProjectAngularJson.root = localProjectAngularJson.root
    ? prepandRootPath(localProjectAngularJson.root, localRootPath)
    : localRootPath;

  traverse(localProjectAngularJson, (targetPropertyKey: string, path: any, targetProperty: any): void => {
    if (typeof path !== 'string') {
      return;
    }

    const isDirectoryPattern = directoryPatterns.some(pattern => pattern.test(path));

    if (isDirectoryPattern || fileExtensionsPattern.test(path)) {
      targetProperty[targetPropertyKey] = prepandRootPath(path, localRootPath);
    }
  });
}

/**
 * Builder implementation
 */
function builder(options: BuilderOptions) {
  return new Promise<BuilderOutput>(async (resolve, reject) => {
    console.log(`ng-build-expander: "${options.project}" Expanding...`);

    // getting root `angular.json`
    const rootAngularJsonPath = 'angular.json';
    const rootAngularJson = await readFileAsJson(rootAngularJsonPath)
      .catch(error => reject(error)) as JsonObjectMaps;

    // getting local project's config from root `angular.json`
    const rootProjectAngularJson = rootAngularJson.projects[options.project] as JsonObjectMaps || {};

    // getting local project's `projects/project/angular.json`
    const localProjectsRootPath = options.projectsRootPath || rootAngularJson.newProjectRoot;
    const localRootPath = `${localProjectsRootPath}/${options.project}`;
    const localAngularJsonPath = `${localRootPath}/${rootAngularJsonPath}`;
    const localAngularJson = await readFileAsJson(localAngularJsonPath)
      .catch(error => reject(error)) as JsonObjectMaps;

    // getting local project's config from local `projects/project/angular.json`
    const localProjectAngularJson = localAngularJson.projects[options.project] as JsonObjectMaps || {};

    // overriding local paths `src/` into root paths `projects/project/src`
    // overriding file paths `tsconfig.app.json` into root paths `projects/project/tsconfig.app.json`
    overrideLocalInToRootPaths(localProjectAngularJson, localRootPath);

    // merging local `projects/project/angular.json` into root `angular.json`
    rootAngularJson.projects[options.project] = mergeDeep(localProjectAngularJson, rootProjectAngularJson);

    writeFileAsJson(rootAngularJsonPath, rootAngularJson)
      .then(() => {
        console.log(`ng-build-expander: "${options.project}" Done`);
        resolve({ success: true });
      })
      .catch(error => reject(error));
  });
};

export default createBuilder(builder);

