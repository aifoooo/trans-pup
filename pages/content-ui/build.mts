import { resolve } from 'node:path';
import { makeEntryPointPlugin } from '@extension/hmr';
import { getContentScriptEntries, withPageConfig } from '@extension/vite-config';
import { IS_DEV } from '@extension/env';
import { build } from 'vite';
import { build as buildTW } from 'tailwindcss/lib/cli/build';
import { existsSync, mkdirSync } from 'node:fs';

const rootDir = resolve(import.meta.dirname);
const srcDir = resolve(rootDir, 'src');
const matchesDir = resolve(srcDir, 'matches');

const configs = Object.entries(getContentScriptEntries(matchesDir)).map(([name, entry]) => ({
  name,
  config: withPageConfig({
    mode: IS_DEV ? 'development' : undefined,
    resolve: {
      alias: {
        '@src': srcDir,
      },
    },
    publicDir: resolve(rootDir, 'public'),
    plugins: [IS_DEV && makeEntryPointPlugin()],
    build: {
      lib: {
        name: name,
        formats: ['iife'],
        entry,
        fileName: name,
      },
      outDir: resolve(rootDir, '..', '..', 'dist', 'content-ui'),
    },
  }),
}));

const builds = configs.map(async ({ name, config }) => {
  const folder = resolve(matchesDir, name);
  const inputCss = resolve(folder, 'index.css');
  const outputDir = resolve(rootDir, 'dist', name);

  // 确保输出目录存在
  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const outputCss = resolve(outputDir, 'index.css');
  const configPath = resolve(rootDir, 'tailwind.config.ts');

  // 先构建 Tailwind CSS
  const args = {
    ['--input']: inputCss,
    ['--output']: outputCss,
    ['--config']: configPath,
    ['--minify']: true,
    ['--watch']: IS_DEV,
  };

  await buildTW(args);

  // 然后构建 JavaScript
  //@ts-expect-error This is hidden property into vite's resolveConfig()
  config.configFile = false;
  await build(config);
});

await Promise.all(builds);
