import '@src/SidePanel.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { vocabularyStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner, WordPanel } from '@extension/ui';
import StatusBar from '@src/components/StatusBar';
import { useEffect, useState, useCallback } from 'react';
import { IoSearch } from 'react-icons/io5';
import { MdKeyboardArrowDown, MdKeyboardArrowRight } from 'react-icons/md';
import type { WordEntry } from '@extension/dictionary';

const SidePanel = () => {
  // 主要数据状态
  const [words, setWords] = useState<WordEntry[]>([]);

  // 分页相关状态
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 搜索和加载状态
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [vocabularyUpdateCount, setVocabularyUpdateCount] = useState(0);

  // 展开单词详情状态
  const [expandedWord, setExpandedWord] = useState<string | null>(null);

  // 获取单词列表
  const fetchWords = useCallback(async (page: number, search: string) => {
    setLoading(true);
    try {
      const result = await vocabularyStorage.getWords(page, 20, search);

      // 检查 result.words 是否存在且为数组
      if (!result.words || !Array.isArray(result.words)) {
        setWords([]);
        setHasMore(false);
        return;
      }

      // 提取单词列表
      const uniqueWords = Array.from(
        new Set(result.words.map(wordItem => (typeof wordItem === 'string' ? wordItem : JSON.stringify(wordItem)))),
      );

      // 向后台脚本发送批量查询请求
      const translatedWords = await new Promise<WordEntry[]>((resolve, reject) => {
        chrome.runtime.sendMessage({ action: 'batchQueryWords', words: uniqueWords }, response => {
          console.log('[popup] Received response from background:', response);
          if (response && typeof response === 'object') {
            resolve(
              uniqueWords.map(word => ({
                word: response[word]?.word || '',
                phonetic: response[word]?.phonetic || '',
                definition: response[word]?.definition || '',
                translation: response[word]?.translation || '',
                pos: response[word]?.pos || '',
                collins: response[word]?.collins || '',
                oxford: response[word]?.oxford || '',
                tag: response[word]?.tag || '',
                bnc: response[word]?.bnc || '',
                frq: response[word]?.frq || '',
                exchange: response[word]?.exchange || '',
              })),
            );
          } else {
            reject(new Error('Failed to query words from background script'));
          }
        });
      });

      // 如果是第一页，替换数据；否则追加数据
      setWords(page === 1 ? translatedWords : prevWords => [...prevWords, ...translatedWords]);

      // 检查是否还有更多数据
      setHasMore(result.words.length === 20);
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
    setCurrentPage(1);
    fetchWords(1, searchTerm);
  }, [fetchWords, searchTerm, vocabularyUpdateCount]);

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

  // 处理展开/收缩点击事件
  const toggleExpand = (word: string) => {
    setExpandedWord(expandedWord === word ? null : word);
  };

  return (
    <div className={cn('App', 'h-full overflow-y-auto pb-6')} onScroll={handleScroll}>
      {/* 单词状态区域 */}
      <StatusBar />

      {/* 单词列表区域 */}
      <div className="mx-5 mt-16 flex min-h-0 flex-1 flex-col">
        <h2 className="mb-2 text-base font-semibold">新单词</h2>
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-gray-200">
          <div className="px-4 py-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                <IoSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索单词"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-lg bg-gray-100 py-2 pl-8 pr-2 text-sm hover:bg-gray-200 focus:bg-gray-100"
              />
            </div>
          </div>
          <ul className="flex-1 divide-y divide-gray-200 border-t border-gray-200">
            {words.length > 0 ? (
              words.map((item, index) => (
                <div key={index}>
                  <div
                    role="button"
                    className="flex cursor-pointer items-center py-3 pl-4 pr-2 transition-colors hover:bg-gray-50"
                    onClick={() => toggleExpand(item.word)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleExpand(item.word);
                      }
                    }}
                    tabIndex={0}
                    aria-expanded={expandedWord === item.word}
                    aria-label={`Toggle details for word ${item.word}`}>
                    <span className="pr-3 text-sm font-bold text-gray-700">{item.word}</span>
                    <span className="flex-1 truncate whitespace-nowrap text-right text-sm text-gray-400">
                      {item.translation}
                    </span>
                    <span>
                      {expandedWord === item.word ? (
                        <MdKeyboardArrowDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <MdKeyboardArrowRight className="h-4 w-4 text-gray-500" />
                      )}
                    </span>
                  </div>

                  {/* 详细信息面板 */}
                  {expandedWord === item.word && <WordPanel entry={item} />}
                </div>
              ))
            ) : (
              <li className="flex items-center justify-center px-4 py-2 text-sm text-gray-500">暂无单词</li>
            )}
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
