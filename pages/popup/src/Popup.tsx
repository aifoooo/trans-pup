import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { globalConfigStorage } from '@extension/storage';
import { ErrorDisplay, ToggleSwitch, LoadingSpinner } from '@extension/ui';
import { IoSearchOutline } from '@react-icons/all-files/io5/IoSearchOutline';
import { IoSettingsOutline } from '@react-icons/all-files/io5/IoSettingsOutline';

const Popup = () => {
  const { autoAnnotation, autoCollection, wordTranslation } = useStorage(globalConfigStorage);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-grow">
        <header className="flex items-center justify-between bg-gray-50 px-4 py-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-medium">TransPup</h1>
          </div>
          <button
            onClick={() => {
              chrome.runtime.openOptionsPage();
            }}
            className="rounded-full p-1 transition-colors hover:bg-gray-200"
            aria-label="设置">
            <IoSettingsOutline size={18} className="text-gray-500" />
          </button>
        </header>
        <div className="relative px-6 pb-2 pt-5">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <IoSearchOutline className="h-4 w-4 text-gray-400" />
            </div>
            <input
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-2 pl-8 pr-4 text-sm hover:bg-gray-200 focus:bg-gray-50"
              placeholder="按下 Enter 进行翻译"
            />
          </div>
        </div>
        <div className="mt-4 space-y-3 border-t border-gray-200 pl-8 pr-6 pt-2 pt-5">
          <ToggleSwitch
            label="启用自动收集"
            checked={autoCollection}
            onChange={globalConfigStorage.toggleAutoCollection}
          />
          <ToggleSwitch
            label="启用自动标注"
            checked={autoAnnotation}
            onChange={globalConfigStorage.toggleAutoAnnotation}
          />
          <ToggleSwitch
            label="启用划词翻译"
            checked={wordTranslation}
            onChange={globalConfigStorage.toggleWordTranslation}
          />
        </div>
      </div>

      <footer className="mt-auto flex items-center justify-between border-t border-gray-200 px-6 py-3 text-xs text-gray-500">
        <span>v0.5.0</span>
        <a
          href="https://github.com/aifoooo/trans-pup.git"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline">
          GitHub
        </a>
      </footer>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
