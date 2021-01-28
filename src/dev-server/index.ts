import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { serveWebpackBrowserPlus } from 'ngx-build-plus/src/plus-dev-server';
import { Transforms } from 'ngx-build-plus/src/utils';
import { expandWorkspaceOptions } from '../utils';

/**
 * Builder context override function
 */
const overrideBuilderContext = (context: BuilderContext): BuilderContext => {
  const TargetCommand = 'build';
  const GetTargetOptionsMethod = 'getTargetOptions';
  const getTargetOptionsFnRef = context.getTargetOptions;

  context[GetTargetOptionsMethod] = async function(): Promise<any> {
    const rawBuildOptions = await getTargetOptionsFnRef.apply(context, arguments);
    context.target = {...context.target, target: TargetCommand} as any;
    return await expandWorkspaceOptions(rawBuildOptions, context);
  }

  return context;
};

/**
 * Builder implementation
 */
export async function serveWebpackBrowser(options: any, context: BuilderContext, transforms: Transforms = {}): Promise<BuilderOutput> {
  const expandedOptions = await expandWorkspaceOptions(options, context)
    .catch(error => console.log(error));

  const overridedContext = overrideBuilderContext(context);
  return serveWebpackBrowserPlus(expandedOptions, overridedContext, transforms)
    .toPromise();
}

export default createBuilder(serveWebpackBrowser);

