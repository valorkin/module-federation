import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { buildWebpackBrowserPlus } from 'ngx-build-plus/src/browser';
import { Transforms } from 'ngx-build-plus/src/utils';
import { expandWorkspaceOptions } from '../utils';

/**
 * Builder implementation
 */
export async function buildWebpackBrowser(options: any, context: BuilderContext, transforms: Transforms = {}): Promise<BuilderOutput> {
  const expandedOptions = await expandWorkspaceOptions(options, context)
    .catch(error => console.log(error));

  return buildWebpackBrowserPlus(expandedOptions, context, transforms)
    .toPromise();
}

export default createBuilder(buildWebpackBrowser);

