import { useEffect, useState } from 'react';
import type React from 'react';

interface TranslationIconProps {
  position: {
    x: number;
    y: number;
  };
  onTranslate: () => void;
}

/**
 * 翻译图标组件
 * 显示在选中文本上方，点击后触发翻译
 */
export const TranslationIcon: React.FC<TranslationIconProps> = ({ position, onTranslate }) => {
  const logo = chrome.runtime.getURL('icon-128.png');

  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // 延迟显示，避免闪烁
    const timer = setTimeout(() => {
      setVisible(true);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="absolute z-[10000] cursor-pointer transition-all duration-200 hover:scale-110"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, 0)', // 水平居中
      }}
      onClick={e => {
        e.stopPropagation();
        onTranslate();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onTranslate();
        }
      }}
      aria-label="翻译">
      {/* 图标背景 */}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 shadow-lg hover:bg-blue-600">
        {/* 翻译图标 */}
        <img src={logo} className="mr-2 h-6 w-6" alt="Logo" />
      </div>
    </div>
  );
};
