import { vocabularyStorage } from '@extension/storage';

const collectWords = function (): string[] {
  console.log('[collect-words] Starting word collection...');

  const text = document.body.textContent || '';
  console.log('[collect-words] Extracted text content length:', text.length);

  const words = text.match(/\b[a-zA-Z]+\b/g) || [];
  console.log('[collect-words] Matched words array length:', words.length);

  const uniqueWords = [...new Set(words)];
  console.log('[collect-words] Unique words array length:', uniqueWords.length);

  vocabularyStorage
    .addWords(uniqueWords)
    .then(() => {
      console.log('[collect-words] Words added to vocabulary storage');
    })
    .catch(error => {
      console.error('[collect-words] Error adding words to vocabulary storage:', error);
    });

  // 仅在开发环境中输出详细信息
  if (process.env.CLI_CEB_DEV === 'true') {
    console.log('[collect-words] Extracted text content (first 100 chars):', text.substring(0, 100));
    console.log('[collect-words] First 10 matched words:', words.slice(0, 30));
    console.log('[collect-words] First 10 unique words:', uniqueWords.slice(0, 30));
  }

  console.log('[collect-words] Word collection completed');
  return uniqueWords;
};

export { collectWords };
