import { BuilderContext, Target, targetFromTargetString } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import { expandWorkspaceOptions } from './expander.util';

/**
 * Builder context override function
 */
export const overrideBuilderContext = (browserTarget: string, context: BuilderContext): BuilderContext => {
  const { target } = targetFromTargetString(browserTarget);
  const getTargetOptionsFnRef: Function = context.getTargetOptions;

  context.getTargetOptions = async function(): Promise<JsonObject> {
    const rawBrowserOptions = await getTargetOptionsFnRef.apply(context, arguments);
    context.target = {...context.target, target} as Target;
    return await expandWorkspaceOptions(rawBrowserOptions, context);
  }

  return context;
};