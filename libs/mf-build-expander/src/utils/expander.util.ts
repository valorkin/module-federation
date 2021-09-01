import { BuilderContext } from '@angular-devkit/architect';
import { mergeDeep, traverse, readFileAsJson } from '.';

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
 * Expander implementation
 */
export const expandWorkspaceOptions = async (options: any, context: BuilderContext): Promise<any> => {
  return new Promise<any>(async (resolve, reject) => {
    const contextTarget = context.target ?? null;

    if (!contextTarget) {
      reject();
    }

    const projectCommand = context.target?.target as string;
    const projectName = context.target?.project as string;
    const projectConfiguration = context.target?.configuration as string;
    const project = await context.getProjectMetadata(projectName)
      .catch(error => reject(error)) as any;

    const projectRootPath = project.root as string;
    const projectLocalAngularJsonPath = `${project.root}/angular.json`;
    const projectLocalAngularJson = await readFileAsJson(projectLocalAngularJsonPath)
      .catch(error => reject(error)) as any;

    // getting local project's config from local `projects/project/angular.json`
    const projectFromLocalAngularJson = projectLocalAngularJson.projects[projectName] as any || {};
    const projectFromLocalAngularJsonArchitect = projectFromLocalAngularJson.architect[projectCommand] || {};
    const projectFromLocalAngularJsonOptions = projectFromLocalAngularJsonArchitect.options || {};
    const projectFromLocalAngularJsonConfigurations = projectFromLocalAngularJsonArchitect.configurations
      ? projectFromLocalAngularJsonArchitect.configurations[projectConfiguration] || {}
      : {};

    // overriding local paths `src/` into root paths `projects/project/src`
    // overriding file paths `tsconfig.app.json` into root paths `projects/project/tsconfig.app.json`
    overrideLocalInToRootPaths(projectFromLocalAngularJsonOptions, projectRootPath);
    overrideLocalInToRootPaths(projectFromLocalAngularJsonConfigurations, projectRootPath);

    return resolve(
      mergeDeep(projectFromLocalAngularJsonOptions, options, projectFromLocalAngularJsonConfigurations)
    );
  });
};