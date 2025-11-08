import { createWordCollector } from '@src/collect-words';
import { createSelectionHandler } from '@src/selection-handler';

// 收集单词
const wordCollector = createWordCollector();
void wordCollector.execute();

// 初始化划词翻译功能
const selectionHandler = createSelectionHandler();
void selectionHandler.init();
