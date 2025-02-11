import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, type PluginOption } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import { configDefaults } from 'vitest/config';

const buildDir = path.join(import.meta.dirname, 'build');

const enableVisualizer = false;

export default defineConfig({
  plugins: [
    solidPlugin(),
    enableVisualizer
      ? (visualizer({
          filename: path.join(buildDir, 'stats.html'),
          sourcemap: true,
          open: true,
        }) as PluginOption)
      : undefined,
  ],
  server: {
    port: 3000,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['node_modules/@testing-library/jest-dom/vitest'],
    // if you have few tests, try commenting this
    // out to improve performance:
    isolate: false,
    exclude: [...configDefaults.exclude, 'build/**/*'],
  },
  build: {
    target: 'esnext',
    sourcemap: enableVisualizer,
    outDir: path.join(buildDir, 'client'),
    minify: 'terser',
  },
  resolve: {
    conditions: ['development', 'browser'],
  },
  css: {
    modules: {
      generateScopedName:
        process.env.NODE_ENV === 'production'
          ? (className, filePath) => {
              const cssNameKey = `${filePath} :: ${className}`;
              let substitutedName = cssNameKeyToSubstitutedName.get(cssNameKey);
              if (substitutedName === undefined) {
                substitutedName = `_${(nextSubstitutedNameNumber++).toString(36)}`;
                cssNameKeyToSubstitutedName.set(cssNameKey, substitutedName);
              }

              return substitutedName;
            }
          : '[name]__[local]__[hash:base64:8]',
    },
  },
});

let nextSubstitutedNameNumber = 0;
const cssNameKeyToSubstitutedName = new Map<string, string>();
