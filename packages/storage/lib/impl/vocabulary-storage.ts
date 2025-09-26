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
};

// 创建词汇本存储实例
const storage = createStorage<string[]>('vocabulary-storage-key', [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

// 单词验证函数 - 检查是否为合法英文单词
const isValidWord = (word: string): boolean => {
  // 基本验证规则:
  // 1. 长度在1-50个字符之间
  // 2. 只包含英文字母
  // 3. 不是纯数字
  // 4. 不是单个字母（除了常见的'a'和'I'）
  if (!word || word.length > 50) {
    return false;
  }

  // 检查是否只包含英文字母
  if (!/^[a-zA-Z]+$/.test(word)) {
    return false;
  }

  // 检查是否是单个字母但不是'a'或'I'
  if (word.length === 1 && word !== 'a' && word !== 'I') {
    return false;
  }

  return true;
};

const vocabularyStorage: VocabularyStorageType = {
  ...storage,

  // 添加单个单词，保持数组按字母顺序排序
  addWord: async (word: string) => {
    // 验证单词是否合法
    if (!isValidWord(word)) {
      console.log(`[vocabulary-storage] Skipped invalid word: ${word}`);
      return;
    }

    // 转换为小写统一格式
    const normalizedWord = word.toLowerCase();

    // 获取当前词汇列表
    const currentVocabulary = await storage.get();

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
    if (!words || words.length === 0) {
      return;
    }

    // 获取当前词汇列表
    const currentVocabulary = await storage.get();
    const existingWords = new Set(currentVocabulary);
    const newWords: string[] = [];

    // 验证并过滤单词
    for (const word of words) {
      // 验证单词是否合法
      if (!isValidWord(word)) {
        console.log(`[vocabulary-storage] Skipped invalid word: ${word}`);
        continue;
      }

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
};

export { vocabularyStorage, type VocabularyStorageType };
