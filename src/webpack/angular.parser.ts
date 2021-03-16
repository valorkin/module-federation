import { IParser, getExportedClassDeclarationName, getExportedClassName } from './parsers';

/**
 *
 */
export const AngularComponentParser: IParser = {
  validate(textCode: string) {
    return /@Component\s*\(\s*{(.*)}\s*\)/s.test(textCode);
  },
  parse(textCode: string) {
    return {
      type: 'angular-ivy-component',
      name: getExportedClassDeclarationName(textCode)
    };
  }
}

/**
 *
 */
export const AngularModuleParser: IParser = {
  validate(textCode: string) {
    return /@NgModule\s*\(\s*{(.*)}\s*\)/s.test(textCode);
  },
  parse(textCode: string) {
    return {
      type: 'angular-ivy-component',
      name: getExportedClassDeclarationName(textCode),
      component: getExportedClassName(textCode)
    };
  }
}
