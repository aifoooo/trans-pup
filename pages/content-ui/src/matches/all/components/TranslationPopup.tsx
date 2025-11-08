import { WordPanel, InlineLoadingSpinner } from '@extension/ui';
import { useState, useEffect, useRef, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
import type { WordEntry } from '@extension/dictionary';
import type { Position } from '@extension/shared';
import type { WordStatus } from '@extension/storage';
import type React from 'react';

interface TranslationPopupProps {
  text: string;
  position: Position;
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

  // 拖拽相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

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

  // 拖拽相关事件处理
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && popupRef.current) {
        // 计算新位置
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;

        // 确保弹窗不会被拖出视口
        const maxX = window.innerWidth - popupRef.current.offsetWidth;
        const maxY = window.innerHeight - popupRef.current.offsetHeight;

        const boundedX = Math.max(0, Math.min(newX, maxX));
        const boundedY = Math.max(0, Math.min(newY, maxY));

        setDragPosition({ x: boundedX, y: boundedY });
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isDragging, dragOffset]);

  // 计算弹窗位置，确保不超出视口
  const getPopupPosition = () => {
    // 如果正在拖拽，使用拖拽位置
    if (dragPosition) {
      return {
        left: dragPosition.x,
        top: dragPosition.y,
        right: undefined,
        bottom: undefined,
      };
    }

    const popupWidth = 400;
    const popupHeight = 434;
    const padding = 10;

    // 将文档坐标转换为视口坐标
    const viewportX = position.x - (window.scrollX || window.pageXOffset);
    const viewportY = position.y - (window.scrollY || window.pageYOffset);

    let left: number | undefined = viewportX - popupWidth / 2;
    let top: number | undefined = viewportY + 10;
    let right: number | undefined;
    let bottom: number | undefined;

    // 检查右边界
    if (left + popupWidth > window.innerWidth - padding) {
      // 右侧超出，使用 right 定位
      right = window.innerWidth - viewportX - popupWidth / 2;
      // 确保right不会导致弹窗超出左边界
      if (right < padding) {
        right = padding;
      }
      left = undefined;
    }

    // 检查左边界（仅在使用left定位时）
    if (left !== undefined && left < padding) {
      left = padding;
    }

    // 检查底部边界
    if (top + popupHeight > window.innerHeight - padding) {
      // 底部超出，使用 bottom 定位
      bottom = window.innerHeight - viewportY - 10;
      // 确保bottom不会导致弹窗超出顶部边界
      if (bottom < padding) {
        bottom = padding;
      }
      top = undefined;
    }

    // 检查顶部边界（仅在使用top定位时）
    if (top !== undefined && top < padding) {
      top = padding;
    }

    return { left, top, right, bottom };
  };

  // 处理拖拽开始
  const handleDragStart = (e: React.MouseEvent) => {
    if (!popupRef.current) return;

    const rect = popupRef.current.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);

    // 开始拖拽时，如果还没有拖拽位置，则初始化为当前显示位置
    if (!dragPosition) {
      // 获取当前弹窗的实际位置
      const computedStyle = window.getComputedStyle(popupRef.current);
      const currentLeft = parseInt(computedStyle.left, 10);
      const currentTop = parseInt(computedStyle.top, 10);

      // 如果能获取到有效的绝对定位值，则使用这些值
      if (!isNaN(currentLeft) && !isNaN(currentTop)) {
        setDragPosition({
          x: currentLeft,
          y: currentTop,
        });
      } else {
        // 否则使用 getPopupPosition 计算的位置
        setDragPosition({
          x: getPopupPosition().left || window.innerWidth - 400 - (getPopupPosition().right || 0),
          y: getPopupPosition().top || window.innerHeight - 400 - (getPopupPosition().bottom || 0),
        });
      }
    }
  };

  // 处理拖拽结束
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const popupPosition = getPopupPosition();

  return (
    <div
      ref={popupRef}
      onMouseDown={e => {
        handleDragStart(e);
        e.stopPropagation();
      }}
      onMouseUp={e => {
        handleDragEnd();
        e.stopPropagation();
      }}
      role="presentation"
      aria-label="翻译弹窗"
      tabIndex={-1}
      className="fixed z-[10000] w-[400px] rounded-lg border border-gray-200 bg-white shadow-2xl"
      style={{
        left: popupPosition.left !== undefined ? `${popupPosition.left}px` : undefined,
        top: popupPosition.top !== undefined ? `${popupPosition.top}px` : undefined,
        right: popupPosition.right !== undefined ? `${popupPosition.right}px` : undefined,
        bottom: popupPosition.bottom !== undefined ? `${popupPosition.bottom}px` : undefined,
      }}>
      {/* 拖拽标题栏 */}
      <div
        className={`flex h-8 w-full items-center justify-between rounded-t-lg bg-gray-50 p-1 ${isDragging ? 'cursor-move' : 'cursor-default'}`}
        onMouseDown={e => {
          handleDragStart(e);
          e.stopPropagation();
        }}
        onMouseUp={e => {
          handleDragEnd();
          e.stopPropagation();
        }}
        role="toolbar"
        aria-label="拖拽工具栏"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            setIsDragging(!isDragging);
          }
        }}>
        <div className="h-full flex-1" />
        {/* 关闭按钮 */}
        <button
          onMouseDown={e => e.stopPropagation()}
          onMouseUp={e => e.stopPropagation()}
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
          aria-label="关闭">
          <IoClose className="h-4 w-4" />
        </button>
      </div>

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
