import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';

// 词汇本存储类型
type VocabularyStorageType = BaseStorageType<string[]> & {
  // 添加单词
  addWord: (word: string) => Promise<void>;
  // 批量添加单词
  addWords: (words: string[]) => Promise<void>;
  // 检查单词是否已存在
  hasWord: (word: string) => Promise<boolean>;
  // 删除单词
  removeWord: (word: string) => Promise<void>;
  // 清空词汇本
  clear: () => Promise<void>;
  // 分页获取单词
  getWords: (page: number, pageSize: number, search?: string) => Promise<{ words: string[]; total: number }>;
};

// 创建词汇本存储实例
const storage = createStorage<string[]>('vocabulary-storage-key', [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

const vocabularyStorage: VocabularyStorageType = {
  ...storage,

  // 添加单个单词，保持数组按字母顺序排序
  addWord: async (word: string) => {
    // 获取当前词汇列表
    const currentVocabulary = await storage.get();

    // 转换为小写统一格式
    const normalizedWord = word.toLowerCase();

    // 检查单词是否已存在
    const exists = currentVocabulary.includes(normalizedWord);
    if (exists) {
      console.debug(`[vocabulary-storage] Word already exists: ${normalizedWord}`);
      return;
    }

    // 添加新单词并按字母顺序排序
    const newVocabulary = [...currentVocabulary, normalizedWord].sort();

    await storage.set(newVocabulary);
    console.log(`[vocabulary-storage] Added new word: ${normalizedWord}`);
  },

  // 批量添加单词，保持数组按字母顺序排序
  addWords: async (words: string[]) => {
    // 获取当前词汇列表
    const currentVocabulary = await storage.get();
    const existingWords = new Set(currentVocabulary);
    const newWords: string[] = [];

    // 验证并过滤单词
    for (const word of words) {
      // 转换为小写统一格式
      const normalizedWord = word.toLowerCase();

      // 检查单词是否已存在
      if (existingWords.has(normalizedWord)) {
        console.debug(`[vocabulary-storage] Word already exists: ${normalizedWord}`);
        continue;
      }

      // 添加到新单词列表
      newWords.push(normalizedWord);
    }

    // 如果有新单词需要添加
    if (newWords.length > 0) {
      const sortedVocabulary = [...currentVocabulary, ...newWords].sort();
      await storage.set(sortedVocabulary);
      console.log(`[vocabulary-storage] Added ${newWords.length} new words`);
    }
  },

  // 检查单词是否已存在
  hasWord: async (word: string) => {
    const normalizedWord = word.toLowerCase();
    const currentVocabulary = await storage.get();
    return currentVocabulary.includes(normalizedWord);
  },

  // 删除单词
  removeWord: async (word: string) => {
    const normalizedWord = word.toLowerCase();
    const currentVocabulary = await storage.get();
    const filteredVocabulary = currentVocabulary.filter(item => item !== normalizedWord);

    if (filteredVocabulary.length !== currentVocabulary.length) {
      await storage.set(filteredVocabulary);
      console.log(`[vocabulary-storage] Removed word: ${normalizedWord}`);
    } else {
      console.log(`[vocabulary-storage] Word not found: ${normalizedWord}`);
    }
  },

  // 清空词汇本
  clear: async () => {
    await storage.set([]);
    console.log('[vocabulary-storage] Cleared all words');
  },

  // 分页获取单词
  getWords: async (page: number, pageSize: number, search?: string) => {
    // 获取当前所有单词
    let words = await storage.get();

    // 如果有搜索关键字，则进行过滤
    if (search) {
      const searchLower = search.toLowerCase();
      words = words.filter(word => word.includes(searchLower));
    }

    // 计算分页数据
    const total = words.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedWords = words.slice(start, end);

    return {
      words: paginatedWords,
      total,
    };
  },
};

export { vocabularyStorage, type VocabularyStorageType };
