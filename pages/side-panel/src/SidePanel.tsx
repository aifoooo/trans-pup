import '@src/SidePanel.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { vocabularyStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import StatCard from '@src/components/StatCard';
import { useEffect, useState, useCallback } from 'react';
import { AiFillRead } from 'react-icons/ai';
import { IoBagHandleOutline, IoSearch } from 'react-icons/io5';
import { MdOutlineNewLabel } from 'react-icons/md';

type WordItem = {
  word: string;
  translation: string;
};

const PAGE_SIZE = 20;

const SidePanel = () => {
  // 主要数据状态
  const [vocabularyCount, setVocabularyCount] = useState(0);
  const [words, setWords] = useState<WordItem[]>([]);

  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 搜索和加载状态
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [vocabularyUpdateCount, setVocabularyUpdateCount] = useState(0);

  // 获取词汇表总数
  const fetchVocabularyCount = useCallback(async () => {
    try {
      const words = await vocabularyStorage.get();
      setVocabularyCount(words.length);
    } catch (error) {
      console.error('Failed to fetch vocabulary count:', error);
    }
  }, []);

  // 获取单词列表
  const fetchWords = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const result = await vocabularyStorage.getWords(page, PAGE_SIZE, search);

      // 检查 result.words 是否存在且为数组
      if (!result.words || !Array.isArray(result.words)) {
        setWords([]);
        setHasMore(false);
        return;
      }

      // 使用默认翻译，因为还没有实现查词功能
      const wordsWithDefaultTranslation = result.words.map(wordItem => {
        const wordValue = typeof wordItem === 'string' ? wordItem : JSON.stringify(wordItem);
        return {
          word: wordValue,
          translation: '默认翻译',
        };
      });

      // 如果是第一页，替换数据；否则追加数据
      setWords(page === 1 ? wordsWithDefaultTranslation : prevWords => [...prevWords, ...wordsWithDefaultTranslation]);

      // 检查是否还有更多数据
      setHasMore(result.words.length === PAGE_SIZE);
    } catch (error) {
      console.error('Failed to fetch words:', error);
      setWords([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加载和搜索时重新加载
  useEffect(() => {
    fetchVocabularyCount();
    setCurrentPage(1);
    fetchWords(1, searchTerm);
  }, [fetchVocabularyCount, fetchWords, searchTerm, vocabularyUpdateCount]);

  // 加载更多数据
  const loadMore = useCallback(() => {
    if (hasMore && !loading) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchWords(nextPage, searchTerm);
    }
  }, [currentPage, fetchWords, hasMore, loading, searchTerm]);

  // 处理滚动到底部的事件
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    // 当滚动到底部时加载更多
    if (scrollHeight - scrollTop <= clientHeight + 10) {
      loadMore();
    }
  };

  // 监听词汇存储变化以刷新数据
  const handleVocabularyChange = useCallback(() => {
    setVocabularyUpdateCount(prev => prev + 1);
  }, []);

  // 订阅词汇存储的变化
  useEffect(() => {
    const unsubscribe = vocabularyStorage.subscribe(handleVocabularyChange);
    return () => {
      unsubscribe();
    };
  }, [handleVocabularyChange]);

  return (
    <div className={cn('App', 'h-full overflow-y-auto px-5 py-6')} onScroll={handleScroll}>
      {/* 状态卡片区域 */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          title="新单词"
          value={vocabularyCount}
          colorClass="bg-green-500"
          icon={<MdOutlineNewLabel className="h-4 w-4 text-white" />}
        />
        <StatCard
          title="学习中"
          value={0}
          colorClass="bg-red-500"
          icon={<AiFillRead className="h-4 w-4 text-white" />}
        />
        <StatCard
          title="已掌握"
          value={0}
          colorClass="bg-yellow-500"
          icon={<IoBagHandleOutline className="h-4 w-4 text-white" />}
        />
      </div>

      {/* 单词列表区域 */}
      <div className="mt-5 flex min-h-0 flex-1 flex-col">
        <h2 className="mb-2 text-lg font-semibold">新单词</h2>
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200">
          <div className="p-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                <IoSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索单词"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-lg bg-gray-100 py-1.5 pl-8 pr-2 text-sm hover:bg-gray-200 focus:bg-gray-100"
              />
            </div>
          </div>
          <ul className="flex-1 divide-y divide-gray-200 border-t border-gray-200">
            {words.map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between space-x-2 px-4 py-2 transition-colors hover:bg-gray-50">
                <span className="text-sm font-bold text-gray-700">{item.word}</span>
                <span className="truncate whitespace-nowrap text-sm text-gray-400">{item.translation}</span>
              </li>
            ))}
            {loading && (
              <li className="flex justify-center py-4">
                <LoadingSpinner />
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
