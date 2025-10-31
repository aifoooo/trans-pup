import { globalConfigStorage } from '@extension/storage';
import type { SelectionInfo } from '@extension/shared';

type SelectionHandler = {
  init: () => void;
  destroy: () => void;
};

/**
 * 创建选词处理器
 * 监听鼠标事件，当用户选中文本时，显示翻译图标
 */
const createSelectionHandler = (): SelectionHandler => {
  let selectionTimeout: ReturnType<typeof setTimeout> | null = null;

  const handleMouseUp = async (event: MouseEvent) => {
    console.log('[selection-handler] Mouse up event triggered', event);

    // 清除之前的定时器
    if (selectionTimeout) {
      clearTimeout(selectionTimeout);
      selectionTimeout = null;
    }

    // 延迟检测选中文本，避免频繁触发
    selectionTimeout = setTimeout(async () => {
      // 检查划词翻译是否启用
      const config = globalConfigStorage.getSnapshot();
      if (!config || !config.wordTranslation) {
        console.log('[selection-handler] Word translation disabled or config not available');
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.toString().length === 0) {
        console.log('[selection-handler] No text selected, hiding icon');
        // 没有选中文本，隐藏图标
        window.postMessage(
          {
            type: 'TRANS_PUP_HIDE_ICON',
          },
          '*',
        );
        return;
      }

      // 文本太长不处理（超过2000个字符）
      const selectedText = selection.toString().trim();
      if (selectedText.length === 0 || selectedText.length > 2000) {
        console.log('[selection-handler] Selected text is empty or too long');
        return;
      }

      // 发送消息显示翻译图标
      const selectionInfo: SelectionInfo = {
        text: selectedText,
        position: {
          x: event.clientX + window.scrollX,
          y: event.clientY + window.scrollY,
          width: 0,
          height: 0,
        },
      };
      window.postMessage(
        {
          type: 'TRANS_PUP_SHOW_ICON',
          data: selectionInfo,
        },
        '*',
      );

      console.log('[selection-handler] Sent TRANS_PUP_SHOW_ICON message with data:', selectionInfo);
    }, 100); // 100ms 延迟
  };

  const handleMouseDown = (event: MouseEvent) => {
    console.log('[selection-handler] Mouse down event triggered', event);

    // 鼠标按下时隐藏图标
    window.postMessage(
      {
        type: 'TRANS_PUP_HIDE_ICON',
      },
      '*',
    );
  };

  return {
    init() {
      console.log('[selection-handler] Selection handler initialized');
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousedown', handleMouseDown);
    },
    destroy() {
      console.log('[selection-handler] Selection handler destroyed');
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
      if (selectionTimeout) {
        clearTimeout(selectionTimeout);
      }
    },
  };
};

export { createSelectionHandler };
