import { cn } from '@extension/ui';
import type { ReactNode } from 'react';

interface MenuItem {
  id: string;
  label: string;
  icon: ReactNode;
}

interface SidebarMenuProps {
  activeMenu: string;
  setActiveMenu: (id: string) => void;
  menuItems: MenuItem[];
  onMenuSelect?: (id: string) => void;
}

const SidebarMenu = ({ activeMenu, setActiveMenu, menuItems, onMenuSelect }: SidebarMenuProps) => (
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

export type { MenuItem };
export default SidebarMenu;
