import { resolve } from 'node:path';
import { makeEntryPointPlugin } from '@extension/hmr';
import { getContentScriptEntries, withPageConfig } from '@extension/vite-config';
import { IS_DEV } from '@extension/env';
import { build } from 'vite';

const rootDir = resolve(import.meta.dirname);
const srcDir = resolve(rootDir, 'src');
const matchesDir = resolve(srcDir, 'matches');

const configs = Object.entries(getContentScriptEntries(matchesDir)).map(([name, entry], index) =>
  withPageConfig(
    {
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
        outDir: resolve(rootDir, '..', '..', 'dist', 'content'),
      },
    },
    index,
  ),
);

const builds = configs.map(config => {
  const name = typeof config.build?.lib === 'object' && config.build.lib !== null ? config.build.lib.name : undefined;
  return async () => {
    try {
      //@ts-expect-error This is hidden property into vite's resolveConfig()
      config.configFile = false;
      await build(config);
    } catch (error) {
      console.error(`构建 ${name} 失败:`, error);
      throw error;
    }
  };
});

// 将并行任务改为串行执行，避免并行执行时部分文件被意外清空
for (const buildTask of builds) {
  await buildTask();
}
