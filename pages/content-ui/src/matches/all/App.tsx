import { TranslationIcon } from '@src/matches/all/components/TranslationIcon';
import { TranslationPopup } from '@src/matches/all/components/TranslationPopup';
import { useEffect, useState } from 'react';
import type { SelectionInfo } from '@extension/shared';

export default function App() {
  const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | null>(null);
  const [showIcon, setShowIcon] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // 监听来自 content script 的消息
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window) {
        return;
      }

      // 检查 event.data 是否存在
      if (!event.data) {
        return;
      }

      const { type, data } = event.data;
      if (type === 'TRANS_PUP_SHOW_ICON') {
        setSelectionInfo(data);
        setShowPopup(false);
        setShowIcon(true);
      } else if (type === 'TRANS_PUP_HIDE_ICON') {
        setShowIcon(false);
        setShowPopup(false);
        setSelectionInfo(null);
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleTranslate = () => {
    setShowIcon(false);
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectionInfo(null);
  };

  // 添加渲染日志以便调试

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
