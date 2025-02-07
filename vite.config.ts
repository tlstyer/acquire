import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';

export default defineConfig({
  plugins: [solidPlugin()],
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
  },
  build: {
    target: 'esnext',
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
