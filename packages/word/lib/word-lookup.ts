import { readFileSync } from 'fs';
import type { WordEntry, WordDictionary } from './types.js';

/**
 * 单词查询工具类
 * 提供高效的单词查询和批量查询功能
 */
export class WordLookup {
  private dictionary: WordDictionary;
  private wordMap: Map<string, WordEntry>;
  private static instance: WordLookup | null = null;

  /**
   * 构造函数
   * @param dictionaryData 词典数据
   */
  constructor(dictionaryData: WordDictionary) {
    this.dictionary = dictionaryData;
    this.wordMap = new Map<string, WordEntry>();
    this.initWordMap();
  }

  /**
   * 从文件加载词典数据
   * @param filePath 词典文件路径
   * @returns WordLookup 实例
   */
  static fromFile(filePath: string): WordLookup {
    const data = readFileSync(filePath, 'utf8');
    const dictionaryData: WordDictionary = JSON.parse(data);
    return new WordLookup(dictionaryData);
  }

  /**
   * 获取单例实例
   * @param filePath 词典文件路径（仅在首次调用时需要）
   * @returns WordLookup 实例
   */
  static getInstance(filePath?: string): WordLookup {
    if (!WordLookup.instance && filePath) {
      WordLookup.instance = WordLookup.fromFile(filePath);
    }
    if (!WordLookup.instance) {
      throw new Error('WordLookup instance has not been initialized.');
    }
    return WordLookup.instance;
  }

  /**
   * 设置单例实例
   * @param instance 要设置的 WordLookup 实例
   */
  static setInstance(instance: WordLookup): void {
    if (WordLookup.instance) {
      console.warn('WordLookup instance already exists. Overwriting existing instance.');
    }
    WordLookup.instance = instance;
  }

  /**
   * 初始化单词映射表
   */
  private initWordMap(): void {
    const { f, d } = this.dictionary;

    d.forEach((wordData: Array<string | number | null | undefined>) => {
      const wordEntry: Partial<WordEntry> = {};

      f.forEach((field: string, index: number) => {
        const value = wordData[index];
        (wordEntry as Record<string, string>)[field] = value === null || value === undefined ? '' : String(value);
      });

      if (wordEntry.word) {
        this.wordMap.set(wordEntry.word.toLowerCase(), wordEntry as WordEntry);
      }
    });
  }

  /**
   * 查询单个单词
   * @param word 单词
   * @returns 单词条目，如果未找到则返回undefined
   */
  lookup(word: string): WordEntry | undefined {
    if (!word) return undefined;
    return this.wordMap.get(word.toLowerCase());
  }

  /**
   * 批量查询单词
   * @param words 单词数组
   * @returns 单词条目映射
   */
  lookupBatch(words: string[]): Map<string, WordEntry | undefined> {
    const results = new Map<string, WordEntry | undefined>();

    words.forEach(word => {
      results.set(word, this.lookup(word));
    });

    return results;
  }

  /**
   * 获取词典中的单词总数
   * @returns 单词总数
   */
  getTotalWords(): number {
    return this.wordMap.size;
  }

  /**
   * 检查单词是否存在
   * @param word 单词
   * @returns 如果单词存在返回true，否则返回false
   */
  hasWord(word: string): boolean {
    if (!word) return false;
    return this.wordMap.has(word.toLowerCase());
  }

  /**
   * 获取所有单词列表
   * @returns 包含所有单词的数组
   */
  getAllWords(): string[] {
    return Array.from(this.wordMap.keys());
  }

  /**
   * 模糊匹配单词（前缀匹配）
   * @param prefix 前缀
   * @param limit 返回结果数量限制，默认为10
   * @returns 匹配的单词列表
   */
  searchByPrefix(prefix: string, limit: number = 10): string[] {
    if (!prefix) return [];

    const lowerPrefix = prefix.toLowerCase();
    const matches: string[] = [];

    const words = Array.from(this.wordMap.keys());
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (word.startsWith(lowerPrefix)) {
        matches.push(word);
        if (matches.length >= limit) break;
      }
    }

    return matches;
  }
}
