import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { ErrorDisplay, LoadingSpinner } from '@extension/ui';

const Popup = () => {
  useStorage(exampleThemeStorage);
  const logo = 'popup/icon-34.png';

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-grow">
        <header className="flex items-center justify-between bg-gray-50 px-4 py-2">
          <div className="flex items-center space-x-2">
            <img src={chrome.runtime.getURL(logo)} className="h-6 w-6" alt="logo" />
            <h1 className="text-base font-medium">TransPup</h1>
          </div>
        </header>
        <div className="px-4 pt-4">
          <textarea
            className="w-full resize-none rounded-md border border-gray-300 p-2"
            rows={2}
            placeholder="按下 Enter 翻译文本框内的文本"></textarea>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-normal">启用自动收集</span>
              <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-300 transition-colors focus:outline-none">
                <span className="absolute left-0.5 inline-block h-4 w-4 rounded-full bg-white transition-transform" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-normal">启用自动标注</span>
              <button className="relative inline-flex h-5 w-9 items-center rounded-full bg-gray-300 transition-colors focus:outline-none">
                <span className="absolute left-0.5 inline-block h-4 w-4 rounded-full bg-white transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-auto flex items-center justify-between border-t border-gray-200 px-4 py-3 text-xs text-gray-500">
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
