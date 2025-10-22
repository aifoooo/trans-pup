import { vocabularyStorage } from '@extension/storage';
import { useCallback, useEffect, useState } from 'react';

const StatusBar = () => {
  const [statusCounts, setStatusCounts] = useState({ new: 0, learning: 0, mastered: 0 });
  const [vocabularyUpdateCount, setVocabularyUpdateCount] = useState(0);

  const fetchStatusCounts = useCallback(async () => {
    try {
      const counts = await vocabularyStorage.getStatusCounts();
      setStatusCounts(counts);
    } catch (error) {
      console.error('Failed to fetch status counts:', error);
    }
  }, []);

  useEffect(() => {
    fetchStatusCounts();
  }, [fetchStatusCounts, vocabularyUpdateCount]);

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
    <div className="fixed left-0 top-0 z-10 w-full bg-gray-50 px-5 py-2.5 text-base font-semibold">
      <span className="text-green-500">{statusCounts.new}</span>
      <span> / </span>
      <span className="text-red-500">{statusCounts.learning}</span>
      <span> / </span>
      <span className="text-yellow-500">{statusCounts.mastered}</span>
    </div>
  );
};

export default StatusBar;
