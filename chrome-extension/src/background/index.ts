import 'webextension-polyfill';
import { WordLookup } from '@extension/dictionary';
import { vocabularyStorage } from '@extension/storage';
import { createTranslator } from '@extension/translator';
import type { WordStatus } from '@extension/storage';

let wordLookupInstance: WordLookup | null = null;

const initWordLookup = async () => {
  if (wordLookupInstance) {
    return;
  }

  try {
    const response = await fetch(chrome.runtime.getURL('core-words.json'));
    const dictionaryData = await response.json();
    if (dictionaryData) {
      wordLookupInstance = new WordLookup(dictionaryData);
    }
  } catch (error) {
    console.error('Failed to load dictionary:', error);
  }
};

let isInitialized = false;
const messageQueue: Array<{ message: unknown; sendResponse: (response?: unknown) => void }> = [];

const processMessageQueue = () => {
  while (messageQueue.length > 0) {
    const queuedItem = messageQueue.shift();
    if (queuedItem) {
      const { message, sendResponse } = queuedItem;
      handleMessage(message, sendResponse);
    }
  }
};

const handleMessage = (message: unknown, sendResponse: (response?: unknown) => void) => {
  const { action, word, words, status, text } = message as {
    action: string;
    word: string | undefined;
    words: string[] | undefined;
    status: WordStatus | undefined;
    text: string | undefined;
  };

  if (action === 'hasWord' && word) {
    // 检查单词是否存在
    if (wordLookupInstance && wordLookupInstance.hasWord(word)) {
      sendResponse({ exists: true });
    } else {
      sendResponse({ exists: false });
    }
  } else if (action === 'batchHasWords' && words) {
    // 批量检查单词是否存在
    if (wordLookupInstance) {
      const wordExistsMap = wordLookupInstance.hasWordsBatch(words);
      const resultObject = Object.fromEntries(wordExistsMap);
      sendResponse(resultObject);
    } else {
      sendResponse(null);
    }
  } else if (action === 'queryWord' && word) {
    // 查询单个单词
    if (wordLookupInstance) {
      const wordEntry = wordLookupInstance.lookup(word);
      sendResponse(wordEntry);
    } else {
      sendResponse(null);
    }
  } else if (action === 'batchQueryWords' && words) {
    // 批量查询单词
    if (wordLookupInstance) {
      const wordEntryMap = wordLookupInstance.lookupBatch(words);
      const resultObject = Object.fromEntries(wordEntryMap);
      sendResponse(resultObject);
    } else {
      sendResponse(null);
    }
  } else if (action === 'removeWord' && word) {
    // 删除单词
    vocabularyStorage.removeWord(word).then(() => {
      sendResponse({ success: true });
    });
  } else if (action === 'getWordStatus' && word) {
    // 获取单词状态
    vocabularyStorage.hasWord(word).then(wordData => {
      sendResponse({ status: wordData?.status || null });
    });
  } else if (action === 'updateWordStatus' && word && status) {
    // 更新单词状态
    vocabularyStorage
      .hasWord(word)
      .then(wordData => {
        if (!wordData) {
          return vocabularyStorage.addWord(word);
        }
        return undefined;
      })
      .then(() => vocabularyStorage.updateWordStatus(word, status))
      .then(() => {
        sendResponse({ success: true });
      });
  } else if (action === 'translate' && text) {
    // 翻译文本（通过 background script 代理，避免 CORS 问题）
    const translatorInstance = createTranslator();
    if (!translatorInstance) {
      sendResponse({ error: '请先配置腾讯云翻译服务的 SecretId 和 SecretKey' });
      return;
    }

    translatorInstance
      .detect(text)
      .then(sourceLanguage => {
        // 源语言是中文时翻译成英文，源语言不是中文时翻译成中文
        const targetLanguage = sourceLanguage === 'zh' ? 'en' : 'zh';
        return translatorInstance.translate(text, sourceLanguage, targetLanguage);
      })
      .then(result => {
        sendResponse({ result });
      })
      .catch(error => {
        console.error('[background] Translation error:', error);
        sendResponse({
          error: error instanceof Error ? error.message : '翻译失败，请稍后重试',
        });
      });
  } else {
    console.warn('Unknown action:', action);
    sendResponse({ error: 'Unknown action' });
  }
};

initWordLookup().then(() => {
  isInitialized = true;
  processMessageQueue();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (!isInitialized) {
    messageQueue.push({ message, sendResponse });
    return true;
  }

  // 确保 message 包含 action 属性再处理
  if (message && typeof message === 'object' && 'action' in message) {
    handleMessage(message, sendResponse);
  } else {
    console.warn('Invalid message received:', message);
    sendResponse({ error: 'Invalid message format' });
  }

  return true;
});
