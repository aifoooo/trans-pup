import { createTranslator, translator } from '@extension/translator';
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import type { WordEntry } from '@extension/dictionary';
import type { WordStatus } from '@extension/storage';

export interface TranslationResult {
  wordEntry: WordEntry | null;
  translatedText: string;
  error: string;
  wordStatus: WordStatus | null;
}

export interface UseTranslationOptions {
  /**
   * 是否使用消息传递方式查询单词状态和翻译（用于 content script 环境）
   * 如果为 false，则直接使用 vocabularyStorage 和 translator（需要传入）
   */
  useMessageForWordStatus?: boolean;
  /**
   * vocabularyStorage 实例（仅在 useMessageForWordStatus 为 false 时使用）
   */
  vocabularyStorage?: {
    hasWord: (word: string) => Promise<{ status: WordStatus } | null>;
  };
}

/**
 * 判断文本是否为单个英文单词
 */
export const isWord = (text: string): boolean => /^[a-zA-Z]+$/.test(text.trim());

/**
 * 查询本地词典
 */
export const queryLocalDictionary = async (word: string): Promise<WordEntry | null> => {
  try {
    const response = await new Promise<WordEntry>((resolve, reject) => {
      chrome.runtime.sendMessage({ action: 'queryWord', word }, response => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(response);
        }
      });
    });

    if (response && response.word) {
      return {
        word: response.word || '',
        phonetic: response.phonetic || '',
        definition: response.definition || '',
        translation: response.translation || '',
        pos: response.pos || '',
        collins: response.collins || '',
        oxford: response.oxford || '',
        tag: response.tag || '',
        bnc: response.bnc || '',
        frq: response.frq || '',
        exchange: response.exchange || '',
      };
    }
    return null;
  } catch (error) {
    console.error('[useTranslation] Local dictionary query failed:', error);
    return null;
  }
};

/**
 * 查询单词状态
 */
export const queryWordStatus = async (word: string, options: UseTranslationOptions): Promise<WordStatus | null> => {
  try {
    if (options.useMessageForWordStatus) {
      // 使用消息传递方式（content script 环境）
      const response = await new Promise<{ status: WordStatus } | null>((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'getWordStatus', word }, response => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response?.status ? { status: response.status } : null);
          }
        });
      });
      return response?.status || null;
    } else if (options.vocabularyStorage) {
      // 直接使用 storage（popup 环境）
      const wordData = await options.vocabularyStorage.hasWord(word);
      return wordData?.status || null;
    }
    return null;
  } catch (error) {
    console.error('[useTranslation] Failed to query word status:', error);
    return null;
  }
};

/**
 * 翻译文本
 * @param text 待翻译文本
 * @param useMessage 是否使用消息传递方式（content script 环境）
 */
export const translateText = async (text: string, useMessage: boolean = false): Promise<string> => {
  if (useMessage) {
    // 使用消息传递方式（content script 环境，避免 CORS 问题）
    try {
      const response = await new Promise<{ result?: string; error?: string }>((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'translate', text }, response => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      });

      if (response.error) {
        throw new Error(response.error);
      }

      if (!response.result) {
        throw new Error('翻译结果为空');
      }

      return response.result;
    } catch (error) {
      console.error('[translateText] Message-based translation failed:', error);
      throw error;
    }
  }

  // 直接使用翻译器（popup/options 环境）
  let translatorToUse = translator;
  if (!translatorToUse) {
    // 再次尝试创建翻译器实例
    translatorToUse = createTranslator();
    if (!translatorToUse) {
      throw new Error('请先配置腾讯云翻译服务的 SecretId 和 SecretKey');
    }
  }

  // 检测源语言
  const sourceLanguage = await translatorToUse.detect(text);

  // 翻译文本（源语言是中文时翻译成英文，源语言不是中文时翻译成中文）
  const result = await translatorToUse.translate(text, sourceLanguage, sourceLanguage === 'zh' ? 'en' : 'zh');

  return result;
};

/**
 * 翻译功能的自定义 Hook
 * 统一处理单词查询、翻译和状态管理
 */
export const useTranslation = (options: UseTranslationOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [wordEntry, setWordEntry] = useState<WordEntry | null>(null);
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState('');
  const [wordStatus, setWordStatus] = useState<WordStatus | null>(null);

  // 使用 ref 存储 wordEntry，避免 updateWordStatus 函数引用变化
  const wordEntryRef = useRef<WordEntry | null>(null);
  useEffect(() => {
    wordEntryRef.current = wordEntry;
  }, [wordEntry]);

  // 使用 useMemo 稳定 options，避免 translate 函数频繁变化
  const stableOptions = useMemo(() => options, [options.useMessageForWordStatus, options.vocabularyStorage]);

  // 订阅 storage 变化，自动更新单词状态
  useEffect(() => {
    // 如果没有 wordEntry，不需要订阅
    if (!wordEntry) {
      return;
    }

    const currentWord = wordEntry.word;

    // 监听 chrome.storage.onChanged 事件
    const handleStorageChange = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      // 只监听 local storage 的变化
      if (areaName !== 'local') {
        return;
      }

      // 检查是否是 vocabulary-storage-key 的变化
      if (changes['vocabulary-storage-key']) {
        console.log('[useTranslation] Vocabulary storage changed, updating word status for:', currentWord);
        // 重新查询单词状态
        queryWordStatus(currentWord, stableOptions)
          .then(newStatus => {
            // 检查单词是否仍然是当前显示的单词（可能在 storage 变化期间已经切换了）
            if (wordEntryRef.current && wordEntryRef.current.word === currentWord) {
              console.log('[useTranslation] Word status updated:', currentWord, '->', newStatus);
              setWordStatus(newStatus);
            }
          })
          .catch(error => {
            console.error('[useTranslation] Failed to update word status from storage change:', error);
          });
      }
    };

    // 添加监听器
    chrome.storage.onChanged.addListener(handleStorageChange);

    // 清理函数
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [wordEntry, stableOptions]);

  /**
   * 执行翻译或查询
   */
  const translate = useCallback(
    async (text: string) => {
      // 清除之前的状态
      setWordEntry(null);
      setWordStatus(null);
      setTranslatedText('');
      setError('');

      // 检查输入文本是否为空
      if (!text.trim()) {
        return;
      }

      setLoading(true);

      try {
        // 判断是否为单词
        const isWordText = isWord(text);
        console.log('[useTranslation] Is word:', isWordText);

        if (isWordText) {
          // 查询本地词典
          const entry = await queryLocalDictionary(text);
          if (entry) {
            // 找到单词，显示单词卡片
            setWordEntry(entry);

            // 查询单词状态
            const status = await queryWordStatus(text, stableOptions);
            setWordStatus(status);
            return;
          }
          // 词典中没有，继续使用翻译API
        }

        // 使用翻译API
        const result = await translateText(text, stableOptions.useMessageForWordStatus);
        setTranslatedText(result);
      } catch (err) {
        console.error('[useTranslation] Translation error:', err);
        setError(err instanceof Error ? err.message : '翻译失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    },
    [stableOptions],
  );

  /**
   * 清除所有状态
   */
  const clear = useCallback(() => {
    setWordEntry(null);
    setWordStatus(null);
    setTranslatedText('');
    setError('');
    setLoading(false);
  }, []);

  /**
   * 只更新单词状态，不重新执行翻译
   * 用于在单词状态改变后快速更新 UI，避免重新执行整个翻译流程
   */
  const updateWordStatus = useCallback(
    async (word: string) => {
      // 只在当前显示的是单词时才更新状态
      // 使用 ref 来获取最新的 wordEntry，避免函数引用变化
      if (wordEntryRef.current && wordEntryRef.current.word === word) {
        const status = await queryWordStatus(word, stableOptions);
        setWordStatus(status);
      }
    },
    [stableOptions],
  );

  return {
    loading,
    wordEntry,
    translatedText,
    error,
    wordStatus,
    translate,
    clear,
    updateWordStatus,
  };
};
