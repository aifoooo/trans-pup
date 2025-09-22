import '@src/Options.css';

import { withErrorBoundary, withSuspense, calculateBreakpoints } from '@extension/shared';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { IoMenuOutline } from '@react-icons/all-files/io5/IoMenuOutline';
import { IoRocketOutline } from '@react-icons/all-files/io5/IoRocketOutline';
import { IoSettingsOutline } from '@react-icons/all-files/io5/IoSettingsOutline';
import ComingSoonContent from '@src/components/ComingSoonContent';
import GeneralSettings from '@src/components/GeneralSettings';
import SidebarMenu from '@src/components/SidebarMenu';
import { useState, useEffect, useRef } from 'react';
import type { MenuItem } from '@src/components/SidebarMenu';

const getMenuPinningInfo = () => {
  const { breakpointPx } = calculateBreakpoints({
    breakpointPx: 60, // 16 rem + 2 rem + 42 rem
  });
  const isMenuPinned = window.innerWidth >= breakpointPx;

  return { breakpointPx, isMenuPinned };
};

const Options = () => {
  const logo = chrome.runtime.getURL('icon-128.png');

  const [, setWindowWidth] = useState(window.innerWidth);
  const [activeMenu, setActiveMenu] = useState('general');
  const [isMenuVisible, setIsMenuVisible] = useState(() => {
    const { isMenuPinned } = getMenuPinningInfo();
    return isMenuPinned;
  });
  const [isScrolled, setIsScrolled] = useState(false);
  const [userManuallyOpenedMenu, setUserManuallyOpenedMenu] = useState(false);

  const menuAreaRef = useRef<HTMLDivElement>(null);
  const contentAreaRef = useRef<HTMLDivElement>(null);
  const { isMenuPinned } = getMenuPinningInfo();

  // 监听窗口大小变化
  useEffect(() => {
    const contentArea = contentAreaRef.current;
    const menuArea = menuAreaRef.current;

    const updateContentAreaClass = () => {
      const { minBreakpointPx, maxBreakpointPx } = calculateBreakpoints({
        minBreakpointPx: 60, // 16 rem + 2 rem + 42 rem
        maxBreakpointPx: 78, // 16 rem + 2 rem + 42 rem + 2rem + 16rem
      });
      const shouldShiftContent = window.innerWidth >= minBreakpointPx && window.innerWidth <= maxBreakpointPx;

      const contentAreaChild = contentAreaRef.current?.firstElementChild as HTMLElement | undefined;
      if (contentAreaChild) {
        contentAreaChild.className = shouldShiftContent
          ? 'min-w-2xl ml-72 max-w-2xl flex-1 overflow-y-auto bg-white'
          : 'min-w-2xl mx-auto max-w-2xl flex-1 overflow-y-auto bg-white';
      }
    };

    const handleScroll = () => {
      const isContentScrolled = (contentAreaRef.current?.scrollTop || 0) > 0;
      const isMenuScrolled = (menuAreaRef.current?.scrollTop || 0) > 0;

      setIsScrolled(isContentScrolled || isMenuScrolled);
    };

    const handleResize = () => {
      setWindowWidth(window.innerWidth);

      // 当窗口宽度小于 60rem (960px) 时隐藏菜单栏
      if (!isMenuPinned) {
        setIsMenuVisible(false);
        setUserManuallyOpenedMenu(false);
      } else {
        setIsMenuVisible(true);
      }

      updateContentAreaClass();
    };

    // 初始化时检查窗口大小
    handleResize();

    // 添加事件监听器
    window.addEventListener('resize', handleResize);
    contentArea?.addEventListener('scroll', handleScroll);
    menuArea?.addEventListener('scroll', handleScroll);

    // 清理事件监听器
    return () => {
      window.removeEventListener('resize', handleResize);
      contentArea?.removeEventListener('scroll', handleScroll);
      menuArea?.removeEventListener('scroll', handleScroll);
    };
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
    {
      id: 'coming-soon',
      label: '敬请期待-test',
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
    <div className={cn('App', 'overflow-hidden bg-white')}>
      <header
        className={cn(
          'fixed inset-x-0 top-0 z-10 flex h-16 items-center bg-white px-6 transition-shadow duration-300',
          isScrolled ? 'border-b border-gray-200 shadow-md' : '',
        )}>
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

      <div className={cn('App-body', 'w-full', 'flex h-screen flex-col')}>
        {/* 左侧导航栏 */}
        <div
          className={cn(
            'App-menu absolute left-0 top-16 flex w-64 flex-col bg-white py-2 transition-transform duration-300 ease-in-out',
            isMenuVisible ? 'translate-x-0' : '-translate-x-full',
          )}>
          <div ref={menuAreaRef} className="flex-1 overflow-y-auto">
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
        <div ref={contentAreaRef} className="mt-16 flex-1 overflow-y-auto pt-2">
          <div className="min-w-2xl mx-auto max-w-2xl bg-white">
            {activeMenu === 'general' && <GeneralSettings />}
            {activeMenu === 'coming-soon' && <ComingSoonContent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Options, <LoadingSpinner />), ErrorDisplay);
