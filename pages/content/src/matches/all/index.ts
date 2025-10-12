import { WordLookup } from '@extension/word';
import { collectWords } from '@src/collect-words';

console.log('[CEB] All content script loaded');

// 请求后台脚本获取词典数据
chrome.runtime.sendMessage({ action: 'getDictionary' }, response => {
  if (response) {
    console.log('Loaded dictionary:', response);
    const wordLookupInstance = new WordLookup(response);
    WordLookup.setInstance(wordLookupInstance);

    collectWords();
  } else {
    console.error('Failed to load dictionary from background script.');
  }
});
