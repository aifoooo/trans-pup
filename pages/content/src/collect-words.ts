import { globalConfigStorage, vocabularyStorage } from '@extension/storage';

type WordCollector = {
  execute: () => Promise<string[]>;
};

/**
 * 创建单词收集器
 * 从页面中提取单词，过滤已存在的单词，并添加到词汇表存储中
 */
const createWordCollector = (): WordCollector => {
  /**
   * 提取页面文本内容
   */
  const extractText = (): string => {
    const text = document.body.textContent || '';
    console.log('[collect-words] Extracted text content length:', text.length);
    return text;
  };

  /**
   * 从文本中提取所有单词
   */
  const extractWords = (text: string): string[] => {
    const words = text.match(/\b[a-zA-Z]+\b/g) || [];
    console.log('[collect-words] Matched words array length:', words.length);
    return words;
  };

  /**
   * 规范化单词（转为小写）
   */
  const normalizeWords = (words: string[]): string[] => {
    const normalizedWords = words.map(word => word.toLowerCase());
    console.log('[collect-words] Normalized words array length:', normalizedWords.length);
    return normalizedWords;
  };

  /**
   * 去重单词
   */
  const deduplicateWords = (words: string[]): string[] => {
    const uniqueWords = [...new Set(words)];
    console.log('[collect-words] Unique words array length:', uniqueWords.length);
    return uniqueWords;
  };

  /**
   * 查询背景脚本，过滤已存在的单词
   */
  const filterExistingWords = async (words: string[]): Promise<string[]> => {
    const filteredWords = await new Promise<string[]>((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'batchHasWords', words }, response => {
        console.log('[collect-words] Received response from background:', response);
        if (response) {
          resolve(words.filter(word => response[word]));
        } else {
          reject(new Error('Failed to query words from background script'));
        }
      });
    });

    console.log('[collect-words] Filtered words array length:', filteredWords.length);
    return filteredWords;
  };

  /**
   * 将单词添加到词汇表存储
   */
  const addWordsToStorage = async (words: string[]): Promise<void> => {
    try {
      await vocabularyStorage.addWords(words);
      console.log('[collect-words] Words added to vocabulary storage');
    } catch (error) {
      console.error('[collect-words] Error adding words to vocabulary storage:', error);
    }
  };

  /**
   * 输出开发环境调试信息
   */
  const logDebugInfo = (
    text: string,
    words: string[],
    normalizedWords: string[],
    uniqueWords: string[],
    filteredWords: string[],
  ): void => {
    if (process.env.CLI_CEB_DEV === 'true') {
      console.log('[collect-words] Extracted text content (first 100 chars):', text.substring(0, 100));
      console.log('[collect-words] First 30 matched words:', words.slice(0, 30));
      console.log('[collect-words] First 30 normalized words:', normalizedWords.slice(0, 30));
      console.log('[collect-words] First 30 unique words:', uniqueWords.slice(0, 30));
      console.log('[collect-words] First 30 filtered words:', filteredWords.slice(0, 30));
    }
  };

  return {
    async execute(): Promise<string[]> {
      console.log('[collect-words] Starting word collection...');

      // 检查自动收集是否启用
      const config = await globalConfigStorage.get();
      if (!config || !config.autoCollection) {
        console.log('[collect-words] Auto collection disabled or config not available');
        return [];
      }

      const text = extractText();
      const words = extractWords(text);
      const normalizedWords = normalizeWords(words);
      const uniqueWords = deduplicateWords(normalizedWords);

      const filteredWords = await filterExistingWords(uniqueWords);

      // 异步添加单词到存储，不阻塞返回
      void addWordsToStorage(filteredWords);

      logDebugInfo(text, words, normalizedWords, uniqueWords, filteredWords);

      console.log('[collect-words] Word collection completed');
      return uniqueWords;
    },
  };
};

export { createWordCollector };
