import '@src/Options.css';

import { withErrorBoundary, withSuspense } from '@extension/shared';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { IoMenuOutline } from '@react-icons/all-files/io5/IoMenuOutline';
import { IoRocketOutline } from '@react-icons/all-files/io5/IoRocketOutline';
import { IoSettingsOutline } from '@react-icons/all-files/io5/IoSettingsOutline';
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
}

const SidebarMenu = ({
  activeMenu,
  setActiveMenu,
  menuItems,
  onMenuSelect,
}: {
  activeMenu: string;
  setActiveMenu: (id: string) => void;
  menuItems: MenuItem[];
  onMenuSelect?: (id: string) => void;
}) => (
  <div className="flex flex-col gap-0">
    {menuItems.map(item => (
      <button
        key={item.id}
        className={cn(
          'flex w-full items-center rounded-r-full px-6 py-2 text-left text-base font-medium focus:outline-none',
          activeMenu === item.id ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100',
        )}
        onClick={() => {
          setActiveMenu(item.id);
          onMenuSelect?.(item.id);
        }}>
        {item.icon}
        <span>{item.label}</span>
      </button>
    ))}
  </div>
);

const GeneralSettings = () => (
  <div className="mx-auto max-w-2xl bg-white">
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
);

const ComingSoonContent = () => (
  <div className="mx-auto max-w-2xl bg-white">
    <h2 className="mb-4 text-left text-base">更多功能</h2>
    <form className="flex flex-col space-y-4 rounded-lg border border-gray-200 px-8 py-6 shadow-lg">
      <span className="text-base text-gray-700">Coming soon...</span>
    </form>
  </div>
);

const getMenuPinningInfo = () => {
  const breakpointRem = 80;
  const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const breakpointPx = breakpointRem * rootFontSize;
  const isMenuPinned = window.innerWidth >= breakpointPx;

  return { breakpointPx, isMenuPinned };
};

const Options = () => {
  const logo = chrome.runtime.getURL('icon-128.png');

  const [, setWindowWidth] = useState(window.innerWidth);
  const { isMenuPinned } = getMenuPinningInfo();
  const [isMenuVisible, setIsMenuVisible] = useState(() => {
    const { isMenuPinned } = getMenuPinningInfo();
    return isMenuPinned;
  });
  const [activeMenu, setActiveMenu] = useState('general');
  const [userManuallyOpenedMenu, setUserManuallyOpenedMenu] = useState(false);

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);

      // 当窗口宽度小于 80rem (1280px) 时隐藏菜单栏
      if (isMenuPinned) {
        setIsMenuVisible(true);
      } else {
        setIsMenuVisible(false);
        setUserManuallyOpenedMenu(false);
      }
    };

    // 初始化时检查窗口大小
    handleResize();

    // 添加事件监听器
    window.addEventListener('resize', handleResize);

    // 清理事件监听器
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuPinned]);

  const menuItems: MenuItem[] = [
    {
      id: 'general',
      label: '基本设置',
      icon: (
        <IoSettingsOutline
          size={18}
          className={cn('mr-6', activeMenu === 'general' ? 'text-blue-600' : 'text-gray-700')}
        />
      ),
    },
    {
      id: 'coming-soon',
      label: '敬请期待',
      icon: (
        <IoRocketOutline
          size={18}
          className={cn('mr-6', activeMenu === 'coming-soon' ? 'text-blue-600' : 'text-gray-700')}
        />
      ),
    },
  ];

  const shouldShowOverlay = userManuallyOpenedMenu && isMenuVisible && !isMenuPinned;

  return (
    <div className={cn('App', 'bg-white')}>
      <header className="fixed inset-x-0 top-0 z-10 flex h-16 items-center bg-white px-6">
        {isMenuVisible ? (
          <>
            <img src={logo} className="mr-2 h-6 w-6" alt="Logo" />
          </>
        ) : (
          <button
            className="mr-2 rounded p-1 hover:bg-gray-100 focus:outline-none"
            onClick={() => {
              setIsMenuVisible(true);
              setUserManuallyOpenedMenu(true);
            }}
            aria-label="展开菜单">
            <IoMenuOutline size={24} />
          </button>
        )}
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
          <SidebarMenu
            activeMenu={activeMenu}
            setActiveMenu={setActiveMenu}
            menuItems={menuItems}
            onMenuSelect={() => {
              if (isMenuVisible && !isMenuPinned) {
                setIsMenuVisible(false);
                setUserManuallyOpenedMenu(false);
              }
            }}
          />
        </div>

        {/* 蒙板层 */}
        {shouldShowOverlay && (
          <button
            className="fixed inset-y-0 left-64 right-0 z-10 bg-black bg-opacity-50"
            onClick={() => {
              setIsMenuVisible(false);
              setUserManuallyOpenedMenu(false);
            }}
            aria-label="关闭菜单"
          />
        )}

        {/* 右侧内容区 */}
        <div className="flex-1 overflow-auto px-6 pb-6 pt-2">
          {activeMenu === 'general' && <GeneralSettings />}
          {activeMenu === 'coming-soon' && <ComingSoonContent />}
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
