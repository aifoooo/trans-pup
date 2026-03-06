/* eslint-disable no-useless-escape */
import { createRoot } from 'react-dom/client';
import type { ReactElement } from 'react';

export const initAppWithShadow = ({ id, app, inlineCss }: { id: string; inlineCss: string; app: ReactElement }) => {
  const root = document.createElement('div');
  root.id = id;

  document.body.append(root);

  const rootIntoShadow = document.createElement('div');
  rootIntoShadow.id = `shadow-root-${id}`;

  const shadowRoot = root.attachShadow({ mode: 'open' });

  // 全面覆盖Tailwind的rem单位，强制使用固定px值
  const enhancedCss = `
    :host {
      font-size: 16px !important;
      color-scheme: light only !important;
    }
    
    /* 内部容器完全重置，防止继承页面样式 */
    #shadow-root-${id} {
      all: initial;
      font-size: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      color: #374151;
      box-sizing: border-box;
      /* 设置默认字体粗细，恢复CSS本来含义 */
      font-weight: 400 !important;
    }
    
    #shadow-root-${id} * {
      box-sizing: border-box;
    }
    
    /* 字体大小 - 固定px值 */
    #shadow-root-${id} .text-lg { font-size: 18px !important; line-height: 28px !important; }
    #shadow-root-${id} .text-sm { font-size: 14px !important; line-height: 20px !important; }
    #shadow-root-${id} .text-xs { font-size: 12px !important; line-height: 16px !important; }
    
    /* 间距 - 固定px值 */
    #shadow-root-${id} .p-1 { padding: 4px !important; }
    #shadow-root-${id} .p-2 { padding: 8px !important; }
    #shadow-root-${id} .p-4 { padding: 16px !important; }
    #shadow-root-${id} .p-8 { padding: 32px !important; }
    #shadow-root-${id} .px-1 { padding-left: 4px !important; padding-right: 4px !important; }
    /* eslint-disable-next-line no-useless-escape */
    #shadow-root-${id} .px-1\.5 { padding-left: 6px !important; padding-right: 6px !important; }
    #shadow-root-${id} .px-2 { padding-left: 8px !important; padding-right: 8px !important; }
    #shadow-root-${id} .px-4 { padding-left: 16px !important; padding-right: 16px !important; }
    #shadow-root-${id} .px-5 { padding-left: 20px !important; padding-right: 20px !important; }
    #shadow-root-${id} .py-0 { padding-top: 0 !important; padding-bottom: 0 !important; }
    /* eslint-disable-next-line no-useless-escape */
    #shadow-root-${id} .py-0\.5 { padding-top: 2px !important; padding-bottom: 2px !important; }
    #shadow-root-${id} .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
    #shadow-root-${id} .py-3 { padding-top: 12px !important; padding-bottom: 12px !important; }
    #shadow-root-${id} .pt-2 { padding-top: 8px !important; }
    #shadow-root-${id} .pt-4 { padding-top: 16px !important; }
    #shadow-root-${id} .pb-3 { padding-bottom: 12px !important; }
    #shadow-root-${id} .pb-5 { padding-bottom: 20px !important; }
    #shadow-root-${id} .mr-1 { margin-right: 4px !important; }
    
    /* 间距gap - 固定px值 */
    #shadow-root-${id} .gap-1 { gap: 4px !important; }
    #shadow-root-${id} .gap-2 { gap: 8px !important; }
    #shadow-root-${id} .gap-3 { gap: 12px !important; }
    
    /* 尺寸 - 固定px值 */
    #shadow-root-${id} .h-4 { height: 16px !important; }
    #shadow-root-${id} .h-5 { height: 20px !important; }
    #shadow-root-${id} .h-6 { height: 24px !important; }
    #shadow-root-${id} .w-4 { width: 16px !important; }
    #shadow-root-${id} .w-5 { width: 20px !important; }
    #shadow-root-${id} .w-6 { width: 24px !important; }
    
    /* 圆角 - 固定px值 */
    #shadow-root-${id} .rounded { border-radius: 4px !important; }
    #shadow-root-${id} .rounded-md { border-radius: 6px !important; }
    #shadow-root-${id} .rounded-lg { border-radius: 8px !important; }
    #shadow-root-${id} .rounded-xl { border-radius: 12px !important; }
    #shadow-root-${id} .rounded-t-xl { border-top-left-radius: 12px !important; border-top-right-radius: 12px !important; }
    #shadow-root-${id} .rounded-full { border-radius: 9999px !important; }
    
    /* 边框 - 固定px值 */
    #shadow-root-${id} .border { border-width: 1px !important; }
    /* eslint-disable-next-line no-useless-escape */
    #shadow-root-${id} .p-0\.5 { padding: 2px !important; }
    
    /* 保护图标和图片 */
    #shadow-root-${id} img,
    #shadow-root-${id} svg {
      display: inline-block !important;
      max-width: 100% !important;
      height: auto !important;
      background-image: none !important;
      /* 确保图标有合适的背景 */
      background-color: transparent !important;
    }
    
    /* 腾讯翻译图标特别保护 - 恢复圆形并保持可见 */
    #shadow-root-${id} img[alt="腾讯云"] {
      background-color: #ffffff !important; /* 白色背景，更美观 */
      border-radius: 9999px !important; /* 恢复rounded-full效果 */
      border: 1px solid #d1d5db !important;
      /* 确保宽高生效 */
      min-width: 20px !important;
      min-height: 20px !important;
      padding: 2px !important; /* 恢复p-0.5效果 */
    }
    
    /* 字体粗细保护 - 完全移除，让Tailwind自然控制 */
    /* 移除所有字体粗细强制设置，尊重CSS原本层叠 */
    
    /* 红色字体保护 - 只设置颜色，不碰字体粗细 */
    #shadow-root-${id} .text-red-500 { 
      color: #ef4444 !important; 
    }
    
    ${inlineCss}
  `;

  if (navigator.userAgent.includes('Firefox')) {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = enhancedCss;
    shadowRoot.appendChild(styleElement);
  } else {
    const globalStyleSheet = new CSSStyleSheet();
    globalStyleSheet.replaceSync(enhancedCss);
    shadowRoot.adoptedStyleSheets = [globalStyleSheet];
  }

  shadowRoot.appendChild(rootIntoShadow);
  createRoot(rootIntoShadow).render(app);
};
