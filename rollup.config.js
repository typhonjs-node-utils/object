import resolve          from '@rollup/plugin-node-resolve';
import typescript       from '@rollup/plugin-typescript';
import { generateDTS }  from '@typhonjs-build-test/esm-d-ts';

const sourcemap = true; // Defines whether source maps are generated.

const klonaReplace = `
/**
 * Unlike a "shallow copy" (eg, Object.assign), a "deep clone" recursively traverses a source input and copies its
 * values — instead of references to its values — into a new instance of that input. The result is a structurally 
 * equivalent clone that operates independently of the original source and controls its own values.
 *
 * @category Deep Object Operations
 *
 * @see https://www.npmjs.com/package/klona
 */
declare function klona<T>(input: T): T;
`;

// Bundle all top level external package exports.
const dtsPluginOptions = {
   bundlePackageExports: true,
   dtsReplace: { 'declare function klona<T>\\(input: T\\): T;': klonaReplace }
};

const resolveOptions = { browser: true };

/**
 * @returns {import('rollup').RollupOptions[]}
 */
export default () =>
{
   return [
      {   // This bundle is for the Node distribution.
         input: 'src/index.ts',
         output: [{
            file: 'dist/index.js',
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap,
         }],
         plugins: [
            resolve(resolveOptions),
            typescript({ include: ['src/**/*'] }),
            generateDTS.plugin(dtsPluginOptions)
         ]
      }
   ];
};
