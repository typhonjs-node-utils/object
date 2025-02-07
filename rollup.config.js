import resolve          from '@rollup/plugin-node-resolve';
import typescript       from '@rollup/plugin-typescript';
import { generateDTS }  from '@typhonjs-build-test/esm-d-ts';

const sourcemap = true; // Defines whether source maps are generated.

// Bundle all top level external package exports.
const dtsPluginOptions = {
   bundlePackageExports: true
};

const resolveOptions = { browser: true };

/**
 * @returns {import('rollup').RollupOptions[]}
 */
export default () =>
{
   return [
      {   // This bundle is for the Node distribution.
         input: 'src/functions.ts',
         output: [{
            file: 'dist/functions.js',
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap,
         }],
         plugins: [
            resolve(resolveOptions),
            typescript({ include: ['src/**/*'] }),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
      {   // This bundle is for the Node distribution.
         input: 'src/plugin.ts',
         external: ['./functions.js'],
         output: [{
            file: 'dist/plugin.js',
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap,
         }],
         plugins: [
            resolve(resolveOptions),
            typescript({ include: ['src/**/*'] }),
            generateDTS.plugin(dtsPluginOptions)
         ]
      },
   ];
};
