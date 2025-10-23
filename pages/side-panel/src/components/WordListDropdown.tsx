import { useEffect, useRef, useState } from 'react';
import { FaCheck } from 'react-icons/fa6';
import { IoIosArrowDropdown } from 'react-icons/io';
import type { WordStatus } from '@extension/storage';
import type React from 'react';

interface WordListDropdownProps {
  selectedList: 'all' | WordStatus;
  onSelectList: (list: 'all' | WordStatus) => void;
}

const listLabels: Record<'all' | WordStatus, string> = {
  all: '全部',
  new: '新单词',
  learning: '学习中',
  mastered: '已掌握',
};

const WordListDropdown: React.FC<WordListDropdownProps> = ({ selectedList, onSelectList }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // ESC 键关闭下拉菜单
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (list: 'all' | WordStatus) => {
    onSelectList(list);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* 触发按钮 */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="mb-3 flex w-full cursor-pointer items-center justify-between rounded-lg border border-dashed border-gray-200 p-2 transition-colors hover:bg-gray-50"
        aria-expanded={isOpen}
        aria-haspopup="true"
        tabIndex={0}>
        <h2 className="text-base font-semibold">{listLabels[selectedList]}</h2>
        <IoIosArrowDropdown
          className={`h-5 w-5 font-semibold text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* 下拉菜单 */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 z-50 -mt-3 rounded-lg border border-gray-200 bg-white shadow-lg"
          role="menu"
          aria-label="选择单词列表">
          <div className="py-1">
            {/* 全部 */}
            <button
              onClick={() => handleSelect('all')}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-normal text-gray-700 transition-colors hover:bg-gray-100"
              role="menuitem">
              <span>全部</span>
              {selectedList === 'all' && <FaCheck className="h-3 w-3 text-blue-500" />}
            </button>

            {/* 新单词 */}
            <button
              onClick={() => handleSelect('new')}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-normal text-gray-700 transition-colors hover:bg-gray-100"
              role="menuitem">
              <span>新单词</span>
              {selectedList === 'new' && <FaCheck className="h-3 w-3 text-green-500" />}
            </button>

            {/* 学习中 */}
            <button
              onClick={() => handleSelect('learning')}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-normal text-gray-700 transition-colors hover:bg-gray-100"
              role="menuitem">
              <span>学习中</span>
              {selectedList === 'learning' && <FaCheck className="h-3 w-3 text-red-500" />}
            </button>

            {/* 已掌握 */}
            <button
              onClick={() => handleSelect('mastered')}
              className="flex w-full items-center justify-between px-4 py-2 text-left text-sm font-normal text-gray-700 transition-colors hover:bg-gray-100"
              role="menuitem">
              <span>已掌握</span>
              {selectedList === 'mastered' && <FaCheck className="h-3 w-3 text-yellow-500" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordListDropdown;
