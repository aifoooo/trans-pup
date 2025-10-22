/**
 * 单词状态类型
 * - new: 新单词
 * - learning: 学习中
 * - mastered: 已掌握
 */
export type WordStatus = 'new' | 'learning' | 'mastered';

/**
 * 收藏的单词数据结构
 */
export interface CollectedWord {
  /** 单词 */
  word: string;
  /** 当前状态 */
  status: WordStatus;
  /** 添加时间戳 */
  addedAt: number;
  /** 最后修改时间戳 */
  lastModified: number;
}

/**
 * 查询单词的返回结果
 */
export interface WordsResult {
  /** 单词列表 */
  words: CollectedWord[];
  /** 总数 */
  total: number;
}

/**
 * 各状态单词数量统计
 */
export interface StatusCounts {
  /** 新单词数量 */
  new: number;
  /** 学习中数量 */
  learning: number;
  /** 已掌握数量 */
  mastered: number;
}
