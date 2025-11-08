import { useTranslation } from '@extension/shared';
import { WordPanel, InlineLoadingSpinner, TranslationStatusCard } from '@extension/ui';
import { useState, useEffect, useRef, useCallback } from 'react';
import { IoClose } from 'react-icons/io5';
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

  const popupRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(true);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  // 拖拽相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // 使用翻译 hook（content-ui 环境，使用消息传递）
  const {
    loading,
    wordEntry,
    translatedText,
    error,
    wordStatus: currentWordStatus,
    translate,
  } = useTranslation({
    useMessageForWordStatus: true,
  });

  // 组件卸载时标记
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 在文本变化时执行翻译
  useEffect(() => {
    if (isMounted.current) {
      translate(text);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  // 处理单词删除
  const handleRemoveWord = useCallback(
    async (word: string) => {
      if (!isMounted.current) return;

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
        // 重新翻译以更新状态（仅在组件仍挂载时）
        if (isMounted.current) {
          translate(text);
        }
      } catch (error) {
        console.error('[TranslationPopup] Failed to remove word:', error);
      }
    },
    [text, translate],
  );

  // 处理单词状态改变
  const handleStatusChange = useCallback(
    async (word: string, newStatus: WordStatus) => {
      if (!isMounted.current) return;

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
        // 重新翻译以更新状态（仅在组件仍挂载时）
        if (isMounted.current) {
          translate(text);
        }
      } catch (error) {
        console.error('[TranslationPopup] Failed to update word status:', error);
      }
    },
    [text, translate],
  );

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMounted.current) return;
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // 延迟添加事件监听，避免立即触发
    let timer: NodeJS.Timeout | null = null;
    let isListenerAdded = false;

    timer = setTimeout(() => {
      if (isMounted.current) {
        document.addEventListener('mousedown', handleClickOutside);
        isListenerAdded = true;
      }
    }, 100);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      if (isListenerAdded) {
        document.removeEventListener('mousedown', handleClickOutside);
      }
    };
  }, [onClose]);

  // ESC键关闭
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (!isMounted.current) return;
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
    // 同步 ref 值
    isDraggingRef.current = isDragging;
    dragOffsetRef.current = dragOffset;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMounted.current || !isDraggingRef.current || !popupRef.current) return;

      // 使用 ref 中的最新值，避免闭包问题
      const currentOffset = dragOffsetRef.current;

      // 计算新位置
      const newX = e.clientX - currentOffset.x;
      const newY = e.clientY - currentOffset.y;

      // 确保弹窗不会被拖出视口
      const maxX = window.innerWidth - popupRef.current.offsetWidth;
      const maxY = window.innerHeight - popupRef.current.offsetHeight;

      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));

      if (isMounted.current) {
        setDragPosition({ x: boundedX, y: boundedY });
      }
    };

    const handleMouseUp = () => {
      if (isMounted.current && isDraggingRef.current) {
        setIsDragging(false);
        isDraggingRef.current = false;
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
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

    const popupWidth = 360;
    const popupHeight = 200;
    const padding = 10;

    // 将文档坐标转换为视口坐标
    const viewportX = position.x - (window.scrollX || window.pageXOffset);
    const viewportY = position.y - (window.scrollY || window.pageYOffset);

    let left: number | undefined = viewportX - 60;
    let top: number | undefined = viewportY + 10;
    let right: number | undefined;
    let bottom: number | undefined;

    // 检查右边界
    if (left + popupWidth > window.innerWidth - padding) {
      // 右侧超出，使用 right 定位
      right = window.innerWidth - viewportX - 300;
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
  const handleDragStart = useCallback(
    (e: React.MouseEvent) => {
      if (!isMounted.current || !popupRef.current) return;

      const rect = popupRef.current.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;

      const newOffset = { x: offsetX, y: offsetY };
      setDragOffset(newOffset);
      dragOffsetRef.current = newOffset;
      setIsDragging(true);
      isDraggingRef.current = true;

      // 开始拖拽时，如果还没有拖拽位置，则初始化为当前显示位置
      setDragPosition(prevPosition => {
        if (prevPosition) return prevPosition;

        if (!popupRef.current) return null;

        // 获取当前弹窗的实际位置
        const computedStyle = window.getComputedStyle(popupRef.current);
        const currentLeft = parseInt(computedStyle.left, 10);
        const currentTop = parseInt(computedStyle.top, 10);

        // 如果能获取到有效的绝对定位值，则使用这些值
        if (!isNaN(currentLeft) && !isNaN(currentTop)) {
          return {
            x: currentLeft,
            y: currentTop,
          };
        }

        // 否则使用 getPopupPosition 计算的位置（使用最新的 position）
        const popupWidth = 360;
        const popupHeight = 200;
        const padding = 10;

        // 将文档坐标转换为视口坐标
        const viewportX = position.x - (window.scrollX || window.pageXOffset);
        const viewportY = position.y - (window.scrollY || window.pageYOffset);

        let left: number | undefined = viewportX - 60;
        let top: number | undefined = viewportY + 10;
        let right: number | undefined;
        let bottom: number | undefined;

        // 检查右边界
        if (left + popupWidth > window.innerWidth - padding) {
          right = window.innerWidth - viewportX - 300;
          if (right < padding) {
            right = padding;
          }
          left = undefined;
        }

        // 检查左边界
        if (left !== undefined && left < padding) {
          left = padding;
        }

        // 检查底部边界
        if (top + popupHeight > window.innerHeight - padding) {
          bottom = window.innerHeight - viewportY - 10;
          if (bottom < padding) {
            bottom = padding;
          }
          top = undefined;
        }

        // 检查顶部边界
        if (top !== undefined && top < padding) {
          top = padding;
        }

        return {
          x: left ?? window.innerWidth - popupWidth - (right ?? 0),
          y: top ?? window.innerHeight - popupHeight - (bottom ?? 0),
        };
      });
    },
    [position],
  );

  // 处理拖拽结束
  const handleDragEnd = useCallback(() => {
    if (isMounted.current) {
      setIsDragging(false);
      isDraggingRef.current = false;
    }
  }, []);

  const popupPosition = getPopupPosition();

  return (
    <div
      ref={popupRef}
      onMouseDown={e => {
        e.stopPropagation();
      }}
      onMouseUp={e => {
        // 只在拖拽时处理，避免与标题栏的 onMouseUp 冲突
        if (isDragging) {
          handleDragEnd();
        }
        e.stopPropagation();
      }}
      role="presentation"
      aria-label="翻译弹窗"
      tabIndex={-1}
      className="fixed z-[10000] w-[360px] rounded-lg border border-gray-200 bg-white shadow-2xl"
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
          if (isDragging) {
            handleDragEnd();
          }
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
      <div className="max-h-[166px] overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center p-8">
            <InlineLoadingSpinner />
          </div>
        )}

        {!loading && error && <TranslationStatusCard type="error" title="腾讯翻译" message={error} />}

        {!loading && !error && wordEntry && (
          <WordPanel
            entry={wordEntry}
            showTags={false}
            showExchanges={false}
            currentStatus={currentWordStatus}
            onRemove={() => handleRemoveWord(wordEntry.word)}
            onStatusChange={newStatus => handleStatusChange(wordEntry.word, newStatus)}
          />
        )}

        {!loading && !error && !wordEntry && translatedText && (
          <TranslationStatusCard type="success" title="腾讯翻译" message={translatedText} />
        )}
      </div>
    </div>
  );
};
