import { WordPanel, InlineLoadingSpinner } from '@extension/ui';
import { useState, useEffect, useRef, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import type { WordEntry } from '@extension/dictionary';
import type { WordStatus } from '@extension/storage';
import type React from 'react';

interface TranslationPopupProps {
  text: string;
  position: {
    x: number;
    y: number;
  };
  onClose: () => void;
}

/**
 * 翻译弹窗组件
 * 1. 如果是单词，先查询本地词典
 * 2. 如果不是单词或查不到，使用翻译API
 */
export const TranslationPopup: React.FC<TranslationPopupProps> = ({ text, position, onClose }) => {
  console.log('[TranslationPopup] Rendering...');

  const [loading, setLoading] = useState(true);
  const [wordEntry, setWordEntry] = useState<WordEntry | null>(null);
  const [translatedText, setTranslatedText] = useState('');
  const [error, setError] = useState('');
  const [currentWordStatus, setCurrentWordStatus] = useState<WordStatus | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // 查询单词或翻译
  useEffect(() => {
    const queryOrTranslate = async () => {
      setLoading(true);
      setError('');

      try {
        // 判断是否为单个英文单词
        const isWord = /^[a-zA-Z]+$/.test(text);
        console.log('[TranslationPopup] Is word:', isWord);

        if (isWord) {
          // 查询本地词典
          const response = await new Promise<WordEntry>((resolve, reject) => {
            chrome.runtime.sendMessage({ action: 'queryWord', word: text }, response => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response);
              }
            });
          });

          console.log('[TranslationPopup] Query response:', response);
          if (response && response.word) {
            // 找到单词，显示单词卡片
            setWordEntry(response);

            // 查询单词状态
            try {
              const wordStatus = await new Promise<WordStatus | null>((resolve, reject) => {
                chrome.runtime.sendMessage({ action: 'getWordStatus', word: text }, response => {
                  if (chrome.runtime.lastError) {
                    reject(chrome.runtime.lastError);
                  } else {
                    resolve(response?.status || null);
                  }
                });
              });
              console.log('[TranslationPopup] Word status:', wordStatus);
              setCurrentWordStatus(wordStatus);
            } catch (err) {
              console.error('[TranslationPopup] Failed to query word status:', err);
              setCurrentWordStatus(null);
            }
          } else {
            // 词典中没有，使用翻译API
            await translateText(text);
          }
        } else {
          // 不是单词，直接翻译
          await translateText(text);
        }
      } catch (err) {
        console.error('[TranslationPopup] Query error:', err);
        setError('查询失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    queryOrTranslate();
  }, [text]);

  // 翻译文本
  const translateText = async (sourceText: string) => {
    try {
      // TODO: 这里需要实现翻译功能
      // 暂时显示占位文本
      setTranslatedText(`翻译功能开发中... 原文: ${sourceText}`);
    } catch (err) {
      console.error('[TranslationPopup] Translation error:', err);
      setError('翻译失败，请稍后重试');
    }
  };

  // 处理单词删除
  const handleRemoveWord = useCallback(async (word: string) => {
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'removeWord', word }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
      console.log('[TranslationPopup] Word removed:', word);
      setCurrentWordStatus(null);
    } catch (error) {
      console.error('[TranslationPopup] Failed to remove word:', error);
    }
  }, []);

  // 处理单词状态改变
  const handleStatusChange = useCallback(async (word: string, newStatus: WordStatus) => {
    try {
      await new Promise<void>((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'updateWordStatus', word, status: newStatus }, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
      console.log('[TranslationPopup] Word status updated:', word, '->', newStatus);

      // 更新状态显示
      setCurrentWordStatus(newStatus);
    } catch (error) {
      console.error('[TranslationPopup] Failed to update word status:', error);
    }
  }, []);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // 延迟添加事件监听，避免立即触发
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  // ESC键关闭
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // 计算弹窗位置，确保不超出视口
  const getPopupPosition = () => {
    const popupWidth = 400;
    const popupHeight = 300;
    const padding = 10;

    let left = position.x - popupWidth / 2;
    let top = position.y + 10;

    // 检查右边界
    if (left + popupWidth > window.innerWidth - padding) {
      left = window.innerWidth - popupWidth - padding;
    }

    // 检查左边界
    if (left < padding) {
      left = padding;
    }

    // 检查底部边界
    if (top + popupHeight > window.innerHeight - padding) {
      top = position.y - popupHeight - 10;
    }

    // 检查顶部边界
    if (top < padding) {
      top = padding;
    }

    return { left, top };
  };

  const popupPosition = getPopupPosition();

  return (
    <div
      ref={popupRef}
      onMouseDown={e => e.stopPropagation()}
      onMouseUp={e => e.stopPropagation()}
      role="presentation"
      aria-label="翻译弹窗"
      tabIndex={-1}
      className="fixed z-[10000] w-[400px] rounded-lg border border-gray-200 bg-white shadow-2xl"
      style={{
        left: `${popupPosition.left}px`,
        top: `${popupPosition.top}px`,
      }}>
      {/* 关闭按钮 */}
      <button
        onClick={onClose}
        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        aria-label="关闭">
        <IoClose className="h-4 w-4" />
      </button>

      {/* 内容区域 */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <InlineLoadingSpinner />
          </div>
        )}

        {!loading && error && (
          <div className="p-4 text-center text-sm text-red-500">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && wordEntry && (
          <WordPanel
            entry={wordEntry}
            currentStatus={currentWordStatus}
            onRemove={() => handleRemoveWord(wordEntry.word)}
            onStatusChange={newStatus => handleStatusChange(wordEntry.word, newStatus)}
          />
        )}

        {!loading && !error && !wordEntry && translatedText && (
          <div className="p-4">
            <div className="mb-2 text-sm font-semibold text-gray-600">翻译结果：</div>
            <div className="text-gray-800">{translatedText}</div>
          </div>
        )}
      </div>
    </div>
  );
};
