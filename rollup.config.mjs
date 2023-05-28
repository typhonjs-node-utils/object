import typescript          from '@rollup/plugin-typescript';
import dts                 from 'rollup-plugin-dts';

// Produce sourcemaps or not.
const sourcemap = true;

export default () =>
{
   return [
      {   // This bundle is for the Node distribution.
         input: ['src/functions.ts', 'src/plugin.ts'],
         output: [{
            dir: './dist',
            format: 'es',
            generatedCode: { constBindings: true },
            sourcemap,
         }],
         plugins: [
            typescript({ include: ['src/**/*'] })
         ]
      },

      {   // This bundle is for bundled types.
         input: ['src/functions.ts'],
         output: [{
            file: `./types/functions.d.mts`,
            format: 'es',
            sourcemap: false
         }],
         plugins: [
            typescript({ include: ['src/**/*'], sourceMap: false, inlineSources: false }),
            dts()
         ]
      }
   ];
};
