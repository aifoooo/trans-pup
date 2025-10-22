import type { ValueOrUpdateType } from './base/index.js';

export type BaseStorageType<D> = {
  get: () => Promise<D>;
  set: (value: ValueOrUpdateType<D>) => Promise<void>;
  getSnapshot: () => D | null;
  subscribe: (listener: () => void) => () => void;
};

// 导出词汇相关类型
export type { WordStatus, CollectedWord, WordsResult, StatusCounts } from './base/vocabulary-types.js';
