import { vocabularyStorage } from '@extension/storage';
import { useCallback, useEffect, useState } from 'react';

const StatusBar = () => {
  const [vocabularyCount, setVocabularyCount] = useState(0);

  const fetchVocabularyCount = useCallback(async () => {
    try {
      const words = await vocabularyStorage.get();
      setVocabularyCount(words.length);
    } catch (error) {
      console.error('Failed to fetch vocabulary count:', error);
    }
  }, []);

  useEffect(() => {
    fetchVocabularyCount();
  }, [fetchVocabularyCount]);

  return (
    <div className="fixed left-0 top-0 z-10 w-full bg-gray-50 px-5 py-2.5 text-base font-semibold">
      <span className="text-green-500">{vocabularyCount}</span>
      <span> / </span>
      <span className="text-red-500">0</span>
      <span> / </span>
      <span className="text-yellow-500">0</span>
    </div>
  );
};

export default StatusBar;
