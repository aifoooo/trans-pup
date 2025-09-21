import '@src/Options.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { useState, useEffect } from 'react';

const Options = () => {
  const logo = chrome.runtime.getURL('icon-128.png');

  const [, setWindowWidth] = useState(window.innerWidth);
  const [isMenuVisible, setIsMenuVisible] = useState(true);
  const [activeMenu, setActiveMenu] = useState('general');

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);

      // 当窗口宽度小于 80rem (1280px) 时隐藏菜单栏
      const breakpointRem = 80;
      const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      const breakpointPx = breakpointRem * rootFontSize;

      if (window.innerWidth < breakpointPx) {
        setIsMenuVisible(false);
      } else {
        setIsMenuVisible(true);
      }
    };

    // 初始化时检查窗口大小
    handleResize();

    // 添加事件监听器
    window.addEventListener('resize', handleResize);

    // 清理事件监听器
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={cn('App', 'bg-white')}>
      <header className="fixed inset-x-0 top-0 z-10 flex h-16 items-center bg-white px-6">
        <img src={logo} className="mr-2 h-6 w-6" alt="Logo" />
        <h1 className="mr-2 text-lg font-bold">TransPup</h1>
        <span className="text-sm text-gray-500">v0.5.0</span>
      </header>

      <div className={cn('App-body', 'mt-16 w-full')}>
        {/* 左侧导航栏 */}
        <div
          className={cn(
            'App-menu',
            'absolute left-0 top-16 w-64 bg-white py-2 transition-all duration-300 ease-in-out',
            isMenuVisible ? 'translate-x-0' : '-translate-x-full', // 使用 transform 实现滑动效果
          )}>
          <div className="flex flex-col gap-0">
            <button
              className={cn(
                'w-full rounded-r-full px-6 py-2 text-left text-base font-medium',
                activeMenu === 'general' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100',
              )}
              onClick={() => setActiveMenu('general')}>
              基本设置
            </button>
            <button
              className={cn(
                'w-full rounded-r-full px-6 py-2 text-left text-base font-medium',
                activeMenu === 'coming-soon' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100',
              )}
              onClick={() => setActiveMenu('coming-soon')}>
              敬请期待
            </button>
          </div>
        </div>

        {/* 右侧内容区 */}
        <div className="flex-1 overflow-auto px-6 pb-6 pt-2">
          <div className={'mx-auto max-w-2xl bg-white'}>
            <h2 className="mb-4 text-left text-base">腾讯翻译</h2>

            <form className="flex flex-col space-y-4 rounded-lg border border-gray-200 px-8 py-6 shadow-lg">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="name">
                  SecretId:
                </label>
                <span className="text-sm text-gray-400">（如何获取？）</span>
              </div>

              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700" htmlFor="email">
                  SecretKey:
                </label>
                <span className="text-sm text-gray-400">（如何获取？）</span>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
