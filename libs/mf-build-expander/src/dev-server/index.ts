import { BuilderContext, BuilderOutput, createBuilder } from '@angular-devkit/architect';
import { serveWebpackBrowserPlus } from 'ngx-build-plus/src/plus-dev-server';
import { Transforms } from 'ngx-build-plus/src/utils';
import { expandWorkspaceOptions, overrideBuilderContext } from '../utils';

/**
 * Builder implementation
 */
export async function serveWebpackBrowser(options: any, context: BuilderContext, transforms: Transforms = {}): Promise<BuilderOutput> {
  const expandedOptions = await expandWorkspaceOptions(options, context)
    .catch(error => console.log(error));

  const overridedContext = overrideBuilderContext(expandedOptions.browserTarget, context);
  return serveWebpackBrowserPlus(expandedOptions, overridedContext, transforms)
    .toPromise();
}

export default createBuilder(serveWebpackBrowser);

