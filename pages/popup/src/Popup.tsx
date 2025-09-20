import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { ErrorDisplay, ToggleSwitch, LoadingSpinner } from '@extension/ui';
import { useState } from 'react';

const Popup = () => {
  useStorage(exampleThemeStorage);
  const [autoCollection, setAutoCollection] = useState(false);
  const [autoAnnotation, setAutoAnnotation] = useState(false);
  const [wordTranslation, setWordTranslation] = useState(false);

  return (
    <div className="flex h-screen flex-col">
      <div className="flex-grow">
        <header className="flex items-center justify-between bg-gray-50 px-4 py-2">
          <div className="flex items-center space-x-2">
            <h1 className="text-base font-medium">TransPup</h1>
          </div>
        </header>
        <div className="px-6 pt-5">
          <textarea
            className="w-full resize-none rounded-md border border-gray-300 p-2 text-sm"
            rows={2}
            placeholder="按下 Enter 翻译文本框内的文本"></textarea>
        </div>
        <div className="mt-4 space-y-3 border-t border-gray-200 px-6 pt-5">
          <ToggleSwitch label="启用自动收集" checked={autoCollection} onChange={setAutoCollection} />
          <ToggleSwitch label="启用自动标注" checked={autoAnnotation} onChange={setAutoAnnotation} />
          <ToggleSwitch label="启用划词翻译" checked={wordTranslation} onChange={setWordTranslation} />
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
