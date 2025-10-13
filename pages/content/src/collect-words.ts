import { vocabularyStorage } from '@extension/storage';

const collectWords = async function (): Promise<string[]> {
  console.log('[collect-words] Starting word collection...');

  const text = document.body.textContent || '';
  console.log('[collect-words] Extracted text content length:', text.length);

  const words = text.match(/\b[a-zA-Z]+\b/g) || [];
  console.log('[collect-words] Matched words array length:', words.length);

  const normalizedWords = words.map(word => word.toLowerCase());
  console.log('[collect-words] Normalized words array length:', normalizedWords.length);

  const uniqueWords = [...new Set(normalizedWords)];
  console.log('[collect-words] Unique words array length:', uniqueWords.length);

  const filteredWords = await new Promise<string[]>((resolve, reject) => {
    chrome.runtime.sendMessage({ action: 'batchHasWords', words: uniqueWords }, response => {
      console.log('[collect-words] Received response from background:', response);
      if (response) {
        resolve(uniqueWords.filter(word => response[word]));
      } else {
        reject(new Error('Failed to query words from background script'));
      }
    });
  });

  console.log('[collect-words] Filtered words array length:', filteredWords.length);

  vocabularyStorage
    .addWords(filteredWords)
    .then(() => {
      console.log('[collect-words] Words added to vocabulary storage');
    })
    .catch(error => {
      console.error('[collect-words] Error adding words to vocabulary storage:', error);
    });

  // 仅在开发环境中输出详细信息
  if (process.env.CLI_CEB_DEV === 'true') {
    console.log('[collect-words] Extracted text content (first 100 chars):', text.substring(0, 100));
    console.log('[collect-words] First 30 matched words:', words.slice(0, 30));
    console.log('[collect-words] First 30 normalized words:', normalizedWords.slice(0, 30));
    console.log('[collect-words] First 30 unique words:', uniqueWords.slice(0, 30));
    console.log('[collect-words] First 30 filtered words:', filteredWords.slice(0, 30));
  }

  console.log('[collect-words] Word collection completed');
  return uniqueWords;
};

export { collectWords };
