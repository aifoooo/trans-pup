import 'webextension-polyfill';
import { exampleThemeStorage } from '@extension/storage';

let dictionaryCache: Record<string, unknown> | null = null;

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'getDictionary') {
    if (!dictionaryCache) {
      // 首次加载词典
      fetch(chrome.runtime.getURL('core-words.json'))
        .then(response => response.json())
        .then(data => {
          dictionaryCache = data; // 缓存词典数据
          sendResponse(dictionaryCache);
        })
        .catch(error => {
          console.error('Failed to load dictionary:', error);
          sendResponse(null);
        });
      return true;
    } else {
      // 直接返回缓存的词典数据
      sendResponse(dictionaryCache);
      return true;
    }
  }
  return false;
});

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('Background loaded');
console.log("Edit 'chrome-extension/src/background/index.ts' and save to reload.");
