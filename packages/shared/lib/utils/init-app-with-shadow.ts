import { createRoot } from 'react-dom/client';
import type { ReactElement } from 'react';

export const initAppWithShadow = ({ id, app, inlineCss }: { id: string; inlineCss: string; app: ReactElement }) => {
  const root = document.createElement('div');
  root.id = id;

  document.body.append(root);

  const rootIntoShadow = document.createElement('div');
  rootIntoShadow.id = `shadow-root-${id}`;

  const shadowRoot = root.attachShadow({ mode: 'open' });

  // 最简单的样式隔离：只设置rem基准和颜色方案
  const enhancedCss = `
    :host {
      font-size: 16px !important;
      color-scheme: light only !important;
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
