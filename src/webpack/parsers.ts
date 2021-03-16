/**
 *
 */
export interface IParser {
  validate(code: string): boolean;
  parse(code: string): object;
}

/**
 * Gets class name `Somecomponent` from `export class Somecomponent implements OnInit {}`
 */
export const getExportedClassDeclarationName = (content: string): string | undefined => {
  const execution = /export\s*class\s*(.*){/.exec(content);
  const declaration = execution !== null
    ? execution[1]
    : '';

  return declaration.split(' ').shift();
}

/**
 * Gets class name `Somecomponent` from `export { Somecomponent }`
 */
export const getExportedClassName = (content: string): string | undefined => {
  // const moduleExportsPattern = /exports:\s*\[(.*)\]/;
  const execution = /export\s*{(.*)}/s.exec(content);
  const component = execution !== null
   ? execution[1]
   : '';

  return component.trim();
}