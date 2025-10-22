import { createStorage, StorageEnum } from '../base/index.js';
import type { BaseStorageType } from '../base/index.js';
import type { CollectedWord, WordStatus, WordsResult, StatusCounts } from '../base/vocabulary-types.js';

// 词汇本存储类型
type VocabularyStorageType = BaseStorageType<CollectedWord[]> & {
  // 添加单词
  addWord: (word: string) => Promise<void>;
  // 批量添加单词
  addWords: (words: string[]) => Promise<number>;
  // 检查单词是否已存在
  hasWord: (word: string) => Promise<CollectedWord | null>;
  // 删除单词
  removeWord: (word: string) => Promise<void>;
  // 清空词汇本
  clear: () => Promise<void>;
  // 分页获取单词（全量查询）
  getWords: (page: number, pageSize: number, search?: string) => Promise<WordsResult>;
  // 按状态分页获取单词
  getWordsByStatus: (status: WordStatus, page: number, pageSize: number, search?: string) => Promise<WordsResult>;
  // 更新单词状态
  updateWordStatus: (word: string, newStatus: WordStatus) => Promise<void>;
  // 获取各状态单词数量统计
  getStatusCounts: () => Promise<StatusCounts>;
};

// 创建词汇本存储实例
const storage = createStorage<CollectedWord[]>('vocabulary-storage-key', [], {
  storageEnum: StorageEnum.Local,
  liveUpdate: true,
});

const vocabularyStorage: VocabularyStorageType = {
  ...storage,

  // 添加单个单词，默认状态为 'new'
  addWord: async (word: string) => {
    const currentVocabulary = await storage.get();
    const normalizedWord = word.toLowerCase();

    // 检查单词是否已存在
    const exists = currentVocabulary.some(item => item.word === normalizedWord);
    if (exists) {
      console.debug(`[vocabulary-storage] Word already exists: ${normalizedWord}`);
      return;
    }

    const now = Date.now();
    const newWord: CollectedWord = {
      word: normalizedWord,
      status: 'new',
      addedAt: now,
      lastModified: now,
    };

    // 添加新单词并按字母顺序排序
    const newVocabulary = [...currentVocabulary, newWord].sort((a, b) => a.word.localeCompare(b.word));

    await storage.set(newVocabulary);
    console.log(`[vocabulary-storage] Added new word: ${normalizedWord}`);
  },

  // 批量添加单词，默认状态为 'new'，返回新增单词数量
  addWords: async (words: string[]) => {
    const currentVocabulary = await storage.get();
    const existingWords = new Set(currentVocabulary.map(item => item.word));
    const newWords: CollectedWord[] = [];

    const now = Date.now();

    // 验证并过滤单词
    for (const word of words) {
      const normalizedWord = word.toLowerCase();

      // 检查单词是否已存在
      if (existingWords.has(normalizedWord)) {
        console.debug(`[vocabulary-storage] Word already exists: ${normalizedWord}`);
        continue;
      }

      // 添加到新单词列表
      newWords.push({
        word: normalizedWord,
        status: 'new',
        addedAt: now,
        lastModified: now,
      });
    }

    // 如果有新单词需要添加
    if (newWords.length > 0) {
      const sortedVocabulary = [...currentVocabulary, ...newWords].sort((a, b) => a.word.localeCompare(b.word));
      await storage.set(sortedVocabulary);
      console.log(`[vocabulary-storage] Added ${newWords.length} new words`);
    }

    return newWords.length;
  },

  // 检查单词是否已存在，返回单词对象或 null
  hasWord: async (word: string) => {
    const normalizedWord = word.toLowerCase();
    const currentVocabulary = await storage.get();
    const foundWord = currentVocabulary.find(item => item.word === normalizedWord);
    return foundWord || null;
  },

  // 删除单词
  removeWord: async (word: string) => {
    const normalizedWord = word.toLowerCase();
    const currentVocabulary = await storage.get();
    const filteredVocabulary = currentVocabulary.filter(item => item.word !== normalizedWord);

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

  // 分页获取单词（全量查询，不区分状态）
  getWords: async (page: number, pageSize: number, search?: string) => {
    let words = await storage.get();

    // 如果有搜索关键字，则进行过滤
    if (search) {
      const searchLower = search.toLowerCase();
      words = words.filter(item => item.word.includes(searchLower));
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

  // 按状态分页获取单词
  getWordsByStatus: async (status: WordStatus, page: number, pageSize: number, search?: string) => {
    const allWords = await storage.get();

    // 1. 先按状态过滤
    let filteredWords = allWords.filter(item => item.status === status);

    // 2. 再按搜索词过滤（如果有）
    if (search) {
      const searchLower = search.toLowerCase();
      filteredWords = filteredWords.filter(item => item.word.includes(searchLower));
    }

    // 3. 分页
    const total = filteredWords.length;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const paginatedWords = filteredWords.slice(start, end);

    return {
      words: paginatedWords,
      total,
    };
  },

  // 更新单词状态
  updateWordStatus: async (word: string, newStatus: WordStatus) => {
    const normalizedWord = word.toLowerCase();
    const words = await storage.get();
    const targetWord = words.find(item => item.word === normalizedWord);

    if (targetWord) {
      targetWord.status = newStatus;
      targetWord.lastModified = Date.now();
      await storage.set(words);
      console.log(`[vocabulary-storage] Updated word status: ${normalizedWord} -> ${newStatus}`);
    } else {
      console.warn(`[vocabulary-storage] Word not found for status update: ${normalizedWord}`);
    }
  },

  // 获取各状态单词数量统计
  getStatusCounts: async () => {
    const words = await storage.get();
    return {
      new: words.filter(item => item.status === 'new').length,
      learning: words.filter(item => item.status === 'learning').length,
      mastered: words.filter(item => item.status === 'mastered').length,
    };
  },
};

export { vocabularyStorage, type VocabularyStorageType };
