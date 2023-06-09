import resolve             from '@rollup/plugin-node-resolve';
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
            resolve({ browser: true }),
            typescript({ include: ['src/**/*'] })
         ]
      },

      {   // This bundle is for bundled types.
         input: 'src/functions.ts',
         output: [{
            file: `./types/functions.d.ts`,
            format: 'es',
            sourcemap: false
         }],
         plugins: [
            dts({ respectExternal: true })
         ]
      }
   ];
};
