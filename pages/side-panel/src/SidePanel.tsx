import '@src/SidePanel.css';
import { withErrorBoundary, withSuspense } from '@extension/shared';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';

const SidePanel = () => {
  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <div className="flex items-center space-x-2">
          <h1 className="text-base font-medium">TransPup 侧边栏</h1>
        </div>
      </header>
      
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-gray-500 text-center py-8">
          <p className="mb-2">侧边栏功能已简化</p>
          <p className="text-sm">专注翻译，简洁高效</p>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
