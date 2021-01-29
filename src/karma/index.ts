import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { serveWebpackBrowserPlus } from 'ngx-build-plus/src/karma';
import { Transforms } from 'ngx-build-plus/src/utils';
import { expandWorkspaceOptions } from '../utils';

/**
 * Builder implementation
 */
export async function runWebpackKarma(options: any, context: BuilderContext, transforms: Transforms = {}): Promise<BuilderOutput> {
  const expandedOptions = await expandWorkspaceOptions(options, context)
    .catch(error => console.log(error));

  return serveWebpackBrowserPlus(expandedOptions, context, transforms)
    .toPromise();
}

export default createBuilder(runWebpackKarma);

