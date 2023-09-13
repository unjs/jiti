import { PluginObj } from '@babel/core';
import { declare } from '@babel/helper-plugin-utils';
import { parameterVisitor } from './parameter/parameter-visitor';
import { metadataVisitor } from './metadata/metadata-visitor';

export default declare(
  (api: any): PluginObj => {
    api.assertVersion(7);

    return {
      visitor: {
        Program(programPath) {
          /**
           * We need to traverse the program right here since
           * `@babel/preset-typescript` removes imports at this level.
           *
           * Since we need to convert some typings into **bindings**, used in
           * `Reflect.metadata` calls, we need to process them **before**
           * the typescript preset.
           */
          programPath.traverse({
            ClassDeclaration(path) {
              for (const field of path.get('body').get('body')) {
                if (
                  field.type !== 'ClassMethod' &&
                  field.type !== 'ClassProperty'
                ) {
                  continue;
                }

                parameterVisitor(path, field as any);
                metadataVisitor(path, field as any);
              }

              /**
               * We need to keep binding in order to let babel know where imports
               * are used as a Value (and not just as a type), so that
               * `babel-transform-typescript` do not strip the import.
               */
              (path.parentPath.scope as any).crawl();
            }
          });
        }
      }
    };
  }
);
