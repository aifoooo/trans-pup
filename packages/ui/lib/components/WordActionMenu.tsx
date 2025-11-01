import { useEffect, useRef } from 'react';
import { FaCheck } from 'react-icons/fa6';
import { MdDeleteOutline } from 'react-icons/md';
import type { WordStatus } from '@extension/storage';
import type React from 'react';

interface WordActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentStatus: WordStatus | null; // null 表示单词不在任何列表中
  onRemove: () => void;
  onMoveToNew: () => void;
  onMoveToLearning: () => void;
  onMoveToMastered: () => void;
  // 用于定位菜单位置
  anchorEl: HTMLElement | null;
}

export const WordActionMenu: React.FC<WordActionMenuProps> = ({
  isOpen,
  onClose,
  currentStatus,
  onRemove,
  onMoveToNew,
  onMoveToLearning,
  onMoveToMastered,
  anchorEl,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭菜单
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESC 键关闭菜单
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // 计算菜单位置，确保不超出视口
  const getMenuPosition = () => {
    if (!anchorEl) return { top: 0, left: 0 };

    const rect = anchorEl.getBoundingClientRect();
    const spacing = 4; // 间距 (单位: px)

    // 动态计算菜单尺寸（使用实际 DOM 尺寸或备用值）
    const menuWidth = menuRef.current?.offsetWidth || 160;
    const menuHeight = menuRef.current?.offsetHeight || 187;

    let top = rect.bottom + spacing;
    let left = rect.left;

    // 检查右侧是否超出视口
    if (left + menuWidth > window.innerWidth) {
      // 右对齐到锚点元素
      left = rect.right - menuWidth;
    }

    // 检查左侧是否超出视口
    if (left < 0) {
      left = spacing;
    }

    // 检查底部是否超出视口
    if (top + menuHeight > window.innerHeight) {
      // 显示在锚点上方
      top = rect.top - menuHeight - spacing;
    }

    // 检查顶部是否超出视口
    if (top < 0) {
      top = spacing;
    }

    return { top, left };
  };

  if (!isOpen) return null;

  const position = getMenuPosition();

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 z-40"
        onMouseDown={e => e.stopPropagation()}
        onMouseUp={e => e.stopPropagation()}
        onClick={onClose}
        onKeyDown={e => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
        role="button"
        tabIndex={-1}
        aria-label="关闭菜单"
      />

      {/* 菜单 */}
      <div
        ref={menuRef}
        className="fixed z-50 w-40 rounded-lg border border-gray-200 bg-white shadow-lg"
        role="menu"
        aria-label="单词操作菜单"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
        }}>
        <div className="py-1">
          {/* 从单词列表移除 */}
          <button
            onMouseDown={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
            onClick={onRemove}
            disabled={currentStatus === null}
            className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-normal transition-colors ${
              currentStatus === null ? 'cursor-not-allowed text-gray-400' : 'text-gray-700 hover:bg-gray-100'
            }`}
            role="menuitem">
            <MdDeleteOutline className={`h-4 w-4 ${currentStatus === null ? 'text-gray-400' : 'text-red-500'}`} />
            <span>从列表移除</span>
          </button>

          {/* 分割线 */}
          <div className="my-1 h-px bg-gray-200" role="separator" />

          {/* 移动到标题 */}
          <div className="px-4 py-1 text-xs font-semibold text-gray-500">移动到</div>

          {/* 新单词 */}
          <button
            onMouseDown={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
            onClick={onMoveToNew}
            disabled={currentStatus === 'new'}
            className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm font-normal transition-colors ${
              currentStatus === 'new' ? 'cursor-not-allowed text-gray-400' : 'text-gray-700 hover:bg-gray-100'
            }`}
            role="menuitem">
            <span>新单词</span>
            {currentStatus === 'new' && <FaCheck className="h-3 w-3 text-green-500" />}
          </button>

          {/* 学习中 */}
          <button
            onMouseDown={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
            onClick={onMoveToLearning}
            disabled={currentStatus === 'learning'}
            className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm font-normal transition-colors ${
              currentStatus === 'learning' ? 'cursor-not-allowed text-gray-400' : 'text-gray-700 hover:bg-gray-100'
            }`}
            role="menuitem">
            <span>学习中</span>
            {currentStatus === 'learning' && <FaCheck className="h-3 w-3 text-red-500" />}
          </button>

          {/* 已掌握 */}
          <button
            onMouseDown={e => e.stopPropagation()}
            onMouseUp={e => e.stopPropagation()}
            onClick={onMoveToMastered}
            disabled={currentStatus === 'mastered'}
            className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm font-normal transition-colors ${
              currentStatus === 'mastered' ? 'cursor-not-allowed text-gray-400' : 'text-gray-700 hover:bg-gray-100'
            }`}
            role="menuitem">
            <span>已掌握</span>
            {currentStatus === 'mastered' && <FaCheck className="h-3 w-3 text-yellow-500" />}
          </button>
        </div>
      </div>
    </>
  );
};
