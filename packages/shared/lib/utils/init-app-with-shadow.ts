import { createRoot } from 'react-dom/client';
import type { ReactElement } from 'react';

export const initAppWithShadow = ({ id, app, inlineCss }: { id: string; inlineCss: string; app: ReactElement }) => {
  const root = document.createElement('div');
  root.id = id;

  document.body.append(root);

  const rootIntoShadow = document.createElement('div');
  rootIntoShadow.id = `shadow-root-${id}`;

  // 精准的样式保护：只保护基准，不破坏Tailwind
  rootIntoShadow.style.cssText = `
    font-size: 16px;
  `;

  const shadowRoot = root.attachShadow({ mode: 'open' });

  // 精准CSS保护：只针对页面污染，不破坏内部样式系统
  const enhancedCss = `
    /* 设置Shadow DOM根元素的基准样式 */
    :host {
      font-size: 16px !important;
      color-scheme: light only !important;
      display: block !important;
      --tw-text-base: 16px !important;
      /* 重置页面CSS变量 */
      --text-color: initial;
      --background-color: initial;
      --color: initial;
      --bg-color: initial;
      --font-color: initial;
      --foreground: initial;
      --background: initial;
    }
    
    /* 注入Tailwind CSS */
    ${inlineCss}
    
    /* 高特异性保护规则 - 覆盖页面样式 */
    #shadow-root-${id} {
      all: initial;
      font-size: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      line-height: 1.5;
      color: #000000;
      box-sizing: border-box;
    }
    
    #shadow-root-${id} * {
      box-sizing: border-box;
    }
    
    /* 保护关键背景色 */
    #shadow-root-${id} .bg-white { background-color: #ffffff !important; }
    #shadow-root-${id} .bg-gray-50 { background-color: #f9fafb !important; }
    
    /* 保护关键文字颜色 */
    #shadow-root-${id} .text-gray-700 { color: #374151 !important; }
    #shadow-root-${id} .text-gray-500 { color: #6b7280 !important; }
    #shadow-root-${id} .text-gray-400 { color: #9ca3af !important; }
    #shadow-root-${id} .text-gray-600 { color: #4b5563 !important; }
    #shadow-root-${id} .text-white { color: #ffffff !important; }
    
    /* 保护标签颜色 */
    #shadow-root-${id} .bg-rose-500 { background-color: #f43f5e !important; }
    #shadow-root-${id} .bg-violet-500 { background-color: #8b5cf6 !important; }
    #shadow-root-${id} .bg-orange-500 { background-color: #f97316 !important; }
    #shadow-root-${id} .bg-blue-100 { background-color: #dbeafe !important; }
    #shadow-root-${id} .text-blue-500 { color: #3b82f6 !important; }
    #shadow-root-${id} .text-red-500 { color: #ef4444 !important; }
    #shadow-root-${id} .text-indigo-500 { color: #6366f1 !important; }
    
    /* 保护边框 */
    #shadow-root-${id} .border-gray-200 { border-color: #e5e7eb !important; }
    
    /* 保护字体大小 */
    #shadow-root-${id} .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
    #shadow-root-${id} .text-sm { font-size: 0.875rem !important; line-height: 1.25rem !important; }
    #shadow-root-${id} .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }
    
    /* 保护字体粗细 */
    #shadow-root-${id} .font-bold { font-weight: 700 !important; }
    #shadow-root-${id} .font-semibold { font-weight: 600 !important; }
    #shadow-root-${id} .font-medium { font-weight: 500 !important; }
    
    /* 保护尺寸 */
    #shadow-root-${id} .h-8 { height: 2rem !important; }
    #shadow-root-${id} .h-6 { height: 1.5rem !important; }
    #shadow-root-${id} .h-4 { height: 1rem !important; }
    #shadow-root-${id} .w-6 { width: 1.5rem !important; }
    #shadow-root-${id} .w-4 { width: 1rem !important; }
    
    /* 保护圆角 */
    #shadow-root-${id} .rounded-xl { border-radius: 0.75rem !important; }
    #shadow-root-${id} .rounded-t-xl { border-top-left-radius: 0.75rem !important; border-top-right-radius: 0.75rem !important; }
    #shadow-root-${id} .rounded-full { border-radius: 9999px !important; }
    #shadow-root-${id} .rounded-md { border-radius: 0.375rem !important; }
  `;

  if (navigator.userAgent.includes('Firefox')) {
    /**
     * In the firefox environment, adoptedStyleSheets cannot be used due to the bug
     * @url https://bugzilla.mozilla.org/show_bug.cgi?id=1770592
     *
     * Injecting styles into the document, this may cause style conflicts with the host page
     */
    const styleElement = document.createElement('style');
    styleElement.innerHTML = enhancedCss;
    shadowRoot.appendChild(styleElement);
  } else {
    /** Inject styles into shadow dom */
    const globalStyleSheet = new CSSStyleSheet();
    globalStyleSheet.replaceSync(enhancedCss);
    shadowRoot.adoptedStyleSheets = [globalStyleSheet];
  }

  shadowRoot.appendChild(rootIntoShadow);
  createRoot(rootIntoShadow).render(app);
};
