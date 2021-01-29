import { BuilderContext, BuilderOutput, Target, targetFromTargetString, createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { serveWebpackBrowserPlus } from 'ngx-build-plus/src/plus-dev-server';
import { Transforms } from 'ngx-build-plus/src/utils';
import { expandWorkspaceOptions } from '../utils';

/**
 * Builder context override function
 */
const overrideBuilderContext = (browserTarget: string, context: BuilderContext): BuilderContext => {
  const { target } = targetFromTargetString(browserTarget);
  const getTargetOptionsFnRef: Function = context.getTargetOptions;

  context.getTargetOptions = async function(): Promise<JsonObject> {
    const rawBrowserOptions = await getTargetOptionsFnRef.apply(context, arguments);
    context.target = {...context.target, target} as Target;
    return await expandWorkspaceOptions(rawBrowserOptions, context);
  }

  return context;
};

/**
 * Builder implementation
 */
export async function serveWebpackBrowser(options: any, context: BuilderContext, transforms: Transforms = {}): Promise<BuilderOutput> {
  const expandedOptions = await expandWorkspaceOptions(options, context)
    .catch(error => console.log(error));

  const overridedContext = overrideBuilderContext(options.browserTarget, context);
  return serveWebpackBrowserPlus(expandedOptions, overridedContext, transforms)
    .toPromise();
}

export default createBuilder(serveWebpackBrowser);

