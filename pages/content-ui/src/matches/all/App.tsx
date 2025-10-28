import { TranslationIcon } from '@src/matches/all/components/TranslationIcon';
import { TranslationPopup } from '@src/matches/all/components/TranslationPopup';
import { useEffect, useState } from 'react';
import type { SelectionInfo } from '@extension/shared';

export default function App() {
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null);
  const [showIcon, setShowIcon] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    console.log('[CEB] Content ui all loaded');
    console.log('[content-ui] Runtime content view loaded');

    // 监听来自 content script 的消息
    const handleMessage = (event: MessageEvent) => {
      console.log('[content-ui] Message event received:', event);

      if (event.source !== window) {
        console.log('[content-ui] Message source is not window, ignoring');
        return;
      }

      // 添加更详细的日志记录
      console.log('[content-ui] Event data:', event.data);

      // 检查 event.data 是否存在
      if (!event.data) {
        console.log('[content-ui] Event data is null or undefined');
        return;
      }

      const { type, data } = event.data;
      console.log('[content-ui] Received message:', type, data);

      if (type === 'TRANS_PUP_SHOW_ICON') {
        console.log('[content-ui] Processing TRANS_PUP_SHOW_ICON message');
        setSelectionInfo(data);
        setShowIcon(true);
        setShowPopup(false);
        // 添加额外的日志来确认状态更新
        console.log('[content-ui] State updated: showIcon=true, selectionInfo=', data);
      } else if (type === 'TRANS_PUP_HIDE_ICON') {
        console.log('[content-ui] Processing TRANS_PUP_HIDE_ICON message');
        setShowIcon(false);
        setShowPopup(false);
        setSelectionInfo(null);
        // 添加额外的日志来确认状态更新
        console.log('[content-ui] State updated: showIcon=false');
      } else {
        console.log('[content-ui] Unknown message type:', type);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleTranslate = () => {
    console.log('[content-ui] Translate button clicked');
    setShowIcon(false);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    console.log('[content-ui] Popup closed');
    setShowPopup(false);
    setSelectionInfo(null);
  };

  // 添加渲染日志以便调试
  console.log('[content-ui] Render triggered with state:', { showIcon, showPopup, selectionInfo });

  return (
    <>
      {showIcon && selectionInfo && (
        <div>
          <TranslationIcon position={selectionInfo.position} onTranslate={handleTranslate} />
        </div>
      )}

      {showPopup && selectionInfo && (
        <div>
          <TranslationPopup text={selectionInfo.text} position={selectionInfo.position} onClose={handleClosePopup} />
        </div>
      )}
    </>
  );
}
