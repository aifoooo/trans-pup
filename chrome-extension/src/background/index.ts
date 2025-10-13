import 'webextension-polyfill';
import { WordLookup } from '@extension/dictionary';

let wordLookupInstance: WordLookup | null = null;

const initWordLookup = async () => {
  console.log('Initializing WordLookup...');
  if (wordLookupInstance) {
    return;
  }

  try {
    const response = await fetch(chrome.runtime.getURL('core-words.json'));
    const dictionaryData = await response.json();
    console.log('Loaded dictionary data:', dictionaryData);
    if (dictionaryData) {
      console.log('Creating WordLookup instance with dictionaryData...');
      wordLookupInstance = new WordLookup(dictionaryData);
      console.log('WordLookup instance created successfully.');
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
  const { action, word, words } = message as { action: string; word: string | undefined; words: string[] | undefined };

  if (action === 'hasWord' && word) {
    if (wordLookupInstance && wordLookupInstance.hasWord(word)) {
      sendResponse({ exists: true });
    } else {
      sendResponse({ exists: false });
    }
  } else if (action === 'batchHasWords' && words) {
    console.log('[background] Received batchHasWords request:', words);
    if (wordLookupInstance) {
      const wordExistsMap = wordLookupInstance.hasWordsBatch(words);
      console.log('[background] Sending batchHasWords response:', wordExistsMap);
      const resultObject = Object.fromEntries(wordExistsMap);
      sendResponse(resultObject);
    } else {
      sendResponse(null);
    }
  } else if (action === 'queryWord' && word) {
    if (wordLookupInstance) {
      const wordEntry = wordLookupInstance.lookup(word);
      sendResponse(wordEntry);
    } else {
      sendResponse(null);
    }
  } else if (action === 'batchQueryWords' && words) {
    console.log('[background] Received batchQueryWords request:', words);
    if (wordLookupInstance) {
      const wordEntryMap = wordLookupInstance.lookupBatch(words);
      console.log('[background] Sending batchQueryWords response:', wordEntryMap);
      const resultObject = Object.fromEntries(wordEntryMap);
      sendResponse(resultObject);
    } else {
      sendResponse(null);
    }
  } else {
    console.warn('Unknown action:', action);
    sendResponse({ error: 'Unknown action' });
  }
};

initWordLookup().then(() => {
  console.log('WordLookup initialized');
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
