import {
   configDefaults,
   defineConfig } from 'vitest/config'

export default defineConfig({
   test: {
      exclude: [...configDefaults.exclude],
      include: ['./test/**/*.test.ts'],
      coverage: {
         include: ['src/**'],
         exclude: ['test/**', 'src/plugin.ts'], // TODO: Eventually test the plugin.
         provider: 'v8',
         reporter: ['text', 'json', 'html']
      },
      reporters: ['default', 'html'],
      globals: true
   }
});
