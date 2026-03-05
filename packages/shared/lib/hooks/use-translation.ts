import { createTranslator, translator } from '@extension/translator';
import { useState, useCallback } from 'react';

export interface TranslationResult {
  translatedText: string;
  error: string;
}

export interface UseTranslationOptions {
  /**
   * 是否使用消息传递方式翻译（用于 content script 环境）
   * 如果为 false，则直接使用 translator（popup/options 环境）
   */
  useMessageForTranslation?: boolean;
}





/**
 * 翻译文本
 * @param text 待翻译文本
 * @param useMessageForTranslation 是否使用消息传递方式（content script 环境）
 */
export const translateText = async (text: string, useMessageForTranslation: boolean = false): Promise<string> => {
  if (useMessageForTranslation) {
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
 * 统一处理翻译功能
 */
export const useTranslation = (options: UseTranslationOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState('');

  /**
   * 执行翻译
   */
  const translate = useCallback(
    async (text: string) => {
      // 清除之前的状态
      setTranslatedText('');
      setError('');

      // 检查输入文本是否为空
      if (!text.trim()) {
        return;
      }

      setLoading(true);

      try {
        // 使用翻译API
        const result = await translateText(text, options.useMessageForTranslation);
        setTranslatedText(result);
      } catch (err) {
        console.error('[useTranslation] Translation error:', err);
        setError(err instanceof Error ? err.message : '翻译失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    },
    [options.useMessageForTranslation],
  );

  /**
   * 清除所有状态
   */
  const clear = useCallback(() => {
    setTranslatedText('');
    setError('');
    setLoading(false);
  }, []);

  return {
    loading,
    translatedText,
    error,
    translate,
    clear,
  };
};
