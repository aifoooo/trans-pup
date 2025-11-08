import { useEffect, useState } from 'react';
import type { Position } from '@extension/shared';
import type React from 'react';

interface TranslationIconProps {
  position: Position;
  onTranslate: () => void;
}

/**
 * 翻译图标组件
 * 显示在鼠标位置附近，点击后触发翻译
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
      className="absolute z-[10000] cursor-pointer"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(0.75rem, 0.75rem)',
      }}
      onMouseDown={e => e.stopPropagation()}
      onMouseUp={e => e.stopPropagation()}
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
      {/* 翻译图标 */}
      <div>
        <img src={logo} className="h-5 w-5" alt="Logo" />
      </div>
    </div>
  );
};
