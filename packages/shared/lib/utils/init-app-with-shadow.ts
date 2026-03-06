import { createRoot } from 'react-dom/client';
import type { ReactElement } from 'react';

export const initAppWithShadow = ({ id, app, inlineCss }: { id: string; inlineCss: string; app: ReactElement }) => {
  const root = document.createElement('div');
  root.id = id;

  document.body.append(root);

  const rootIntoShadow = document.createElement('div');
  rootIntoShadow.id = `shadow-root-${id}`;

  // 温和的样式保护：只设置必要的基准，不重置所有样式
  rootIntoShadow.style.cssText = `
    /* 确保rem单位基准为16px，防止页面font-size影响 */
    font-size: 16px;
    /* 确保颜色继承正常 */
    color: inherit;
    background-color: transparent;
  `;

  const shadowRoot = root.attachShadow({ mode: 'open' });

  // 增强的CSS保护：在Tailwind样式之后添加高特异性保护规则
  const enhancedCss = `
    /* 设置Shadow DOM根元素的基准样式 */
    :host {
      /* 确保rem单位计算正确 */
      font-size: 16px !important;
      /* 防止页面color-scheme影响 */
      color-scheme: light only !important;
      /* 确保正常显示 */
      display: block !important;
      /* 重置可能从页面继承的颜色相关CSS变量 */
      --text-color: initial;
      --background-color: initial;
      --color: initial;
      --bg-color: initial;
      --font-color: initial;
      --foreground: initial;
      --background: initial;
      --tw-text-base: 16px !important;
    }
    
    /* 防止页面全局选择器影响Shadow DOM内部元素 */
    :host * {
      /* 重置可能从页面继承的字体相关属性 */
      font-size: inherit !important;
      font-family: inherit !important;
      line-height: inherit !important;
      letter-spacing: inherit !important;
      text-transform: inherit !important;
      font-weight: inherit !important;
      font-style: inherit !important;
      /* 重置颜色相关属性 */
      color: inherit !important;
      background-color: transparent !important;
      border-color: currentColor !important;
      /* 重置布局属性 */
      box-sizing: border-box !important;
      gap: inherit !important;
      margin: inherit !important;
      padding: inherit !important;
      border-width: inherit !important;
      border-style: inherit !important;
      border-radius: inherit !important;
      /* 保持默认display，不强制重置 */
      display: revert-layer !important;
      /* 保持溢出行为 */
      overflow: revert-layer !important;
      /* 保持尺寸限制 */
      max-width: revert-layer !important;
      max-height: revert-layer !important;
    }
    
    /* 保护图片和SVG元素不被重置 */
    :host img,
    :host svg {
      display: inline-block !important;
      max-width: 100% !important;
      height: auto !important;
    }
    
    /* 首先注入Tailwind CSS */
    ${inlineCss}
    
    /* 然后在Tailwind样式之后添加高特异性保护规则 */
    /* 使用ID选择器增加特异性，确保覆盖页面样式 */
    #shadow-root-${id} .bg-white {
      background-color: #ffffff !important;
    }
    
    #shadow-root-${id} .bg-gray-50 {
      background-color: #f9fafb !important;
    }
    
    #shadow-root-${id} .text-gray-700 {
      color: #374151 !important;
    }
    
    #shadow-root-${id} .text-gray-500 {
      color: #6b7280 !important;
    }
    
    #shadow-root-${id} .text-gray-400 {
      color: #9ca3af !important;
    }
    
    #shadow-root-${id} .text-white {
      color: #ffffff !important;
    }
    
    #shadow-root-${id} .text-gray-600 {
      color: #4b5563 !important;
    }
    
    #shadow-root-${id} .text-black {
      color: #000000 !important;
    }
    
    #shadow-root-${id} .text-blue-500 {
      color: #3b82f6 !important;
    }
    
    #shadow-root-${id} .text-red-500 {
      color: #ef4444 !important;
    }
    
    #shadow-root-${id} .text-indigo-500 {
      color: #6366f1 !important;
    }
    
    /* 字体大小保护 */
    #shadow-root-${id} .text-lg {
      font-size: 1.125rem !important;
      line-height: 1.75rem !important;
    }
    
    #shadow-root-${id} .text-sm {
      font-size: 0.875rem !important;
      line-height: 1.25rem !important;
    }
    
    #shadow-root-${id} .text-xs {
      font-size: 0.75rem !important;
      line-height: 1rem !important;
    }
    
    /* 字体粗细 */
    #shadow-root-${id} .font-bold {
      font-weight: 700 !important;
    }
    
    #shadow-root-${id} .font-semibold {
      font-weight: 600 !important;
    }
    
    #shadow-root-${id} .font-medium {
      font-weight: 500 !important;
    }
    
    /* 尺寸保护 */
    #shadow-root-${id} .h-8 {
      height: 2rem !important;
    }
    
    #shadow-root-${id} .h-6 {
      height: 1.5rem !important;
    }
    
    #shadow-root-${id} .h-4 {
      height: 1rem !important;
    }
    
    #shadow-root-${id} .w-6 {
      width: 1.5rem !important;
    }
    
    #shadow-root-${id} .w-4 {
      width: 1rem !important;
    }
    
    #shadow-root-${id} .w-2 {
      width: 0.5rem !important;
    }
    
    /* 圆角 */
    #shadow-root-${id} .rounded-xl {
      border-radius: 0.75rem !important;
    }
    
    #shadow-root-${id} .rounded-t-xl {
      border-top-left-radius: 0.75rem !important;
      border-top-right-radius: 0.75rem !important;
    }
    
    #shadow-root-${id} .rounded-full {
      border-radius: 9999px !important;
    }
    
    #shadow-root-${id} .rounded-md {
      border-radius: 0.375rem !important;
    }
    
    /* 边框 */
    #shadow-root-${id} .border-gray-200 {
      border-color: #e5e7eb !important;
    }
    
    /* 内边距 */
    #shadow-root-${id} .p-1 {
      padding: 0.25rem !important;
    }
    
    #shadow-root-${id} .p-8 {
      padding: 2rem !important;
    }
    
    #shadow-root-${id} .px-1 {
      padding-left: 0.25rem !important;
      padding-right: 0.25rem !important;
    }
    
    #shadow-root-${id} .px-2 {
      padding-left: 0.5rem !important;
      padding-right: 0.5rem !important;
    }
    
    #shadow-root-${id} .px-4 {
      padding-left: 1rem !important;
      padding-right: 1rem !important;
    }
    
    #shadow-root-${id} .py-0 {
      padding-top: 0 !important;
      padding-bottom: 0 !important;
    }
    
    #shadow-root-${id} .py-2 {
      padding-top: 0.5rem !important;
      padding-bottom: 0.5rem !important;
    }
    
    /* 间距 */
    #shadow-root-${id} .gap-1 {
      gap: 0.25rem !important;
    }
    
    #shadow-root-${id} .gap-2 {
      gap: 0.5rem !important;
    }
    
    #shadow-root-${id} .gap-3 {
      gap: 0.75rem !important;
    }
    
    #shadow-root-${id} .space-y-4 > :not([hidden]) ~ :not([hidden]) {
      --tw-space-y-reverse: 0 !important;
      margin-top: calc(1rem * calc(1 - var(--tw-space-y-reverse))) !important;
      margin-bottom: calc(1rem * var(--tw-space-y-reverse)) !important;
    }
    
    /* 标签颜色 */
    #shadow-root-${id} .bg-rose-500 {
      background-color: #f43f5e !important;
    }
    
    #shadow-root-${id} .bg-violet-500 {
      background-color: #8b5cf6 !important;
    }
    
    #shadow-root-${id} .bg-orange-500 {
      background-color: #f97316 !important;
    }
    
    #shadow-root-${id} .bg-blue-100 {
      background-color: #dbeafe !important;
    }
    
    /* 确保关键元素不会被页面样式覆盖 */
    #shadow-root-${id} {
      isolation: isolate !important;
    }
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
