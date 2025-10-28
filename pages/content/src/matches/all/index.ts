import { collectWords } from '@src/collect-words';
import { createSelectionHandler } from '@src/selection-handler';

console.log('[CEB] All content script loaded');

// 收集单词
void collectWords();

// 初始化划词翻译功能
const selectionHandler = createSelectionHandler();
void selectionHandler.init();
