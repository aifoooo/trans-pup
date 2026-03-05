import '@src/Popup.css';
import { useStorage, useTranslation, withErrorBoundary, withSuspense } from '@extension/shared';
import { globalConfigStorage, tencentTranslatorConfigStorage } from '@extension/storage';
import { ErrorDisplay, ToggleSwitch, LoadingSpinner, InlineLoadingSpinner, TranslationStatusCard } from '@extension/ui';
import { useState, useRef, useEffect } from 'react';
import { IoSettingsOutline } from 'react-icons/io5';

const Popup = () => {
  const logo = chrome.runtime.getURL('icon-34.png');

  // 状态变量
  const [inputText, setInputText] = useState('');
  const [, setHasTranslator] = useState(false);

  // 引用变量
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 配置状态
  const { wordTranslation } = useStorage(globalConfigStorage);

  // 使用翻译 hook（popup 环境）
  const {
    loading: isLoading,
    wordEntry,
    translatedText,
    error,
    translate: translateText,
    clear: clearTranslation,
  } = useTranslation({
    useMessageForTranslation: false,
  });

  // 检查是否存在有效的翻译器配置
  // 该副作用用于在组件挂载时检查翻译服务的可用性
  useEffect(() => {
    const checkTranslator = async () => {
      // 检查用户配置
      const config = tencentTranslatorConfigStorage.getSnapshot();
      const hasValidConfig =
        config &&
        config.secretId &&
        config.secretId.trim() !== '' &&
        config.secretKey &&
        config.secretKey.trim() !== '';

      // 检查环境变量中是否配置了腾讯云密钥
      const hasEnvVars = process.env.TENCENTCLOUD_SECRET_ID && process.env.TENCENTCLOUD_SECRET_KEY;

      // 如果配置或环境变量中任一包含有效密钥，则认为翻译服务可用
      setHasTranslator(!!(hasValidConfig || hasEnvVars));
    };

    checkTranslator();
  }, []);

  const handleTranslate = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      await translateText(inputText);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex-grow">
        <header className="flex items-center justify-between bg-gray-50 px-4 py-2">
          <div className="flex items-center space-x-2">
            <img src={logo} className="h-5 w-5" alt="Logo" />
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

        <div className="space-y-5 px-5 py-6">
          <div className="relative -mb-1">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => {
                setInputText(e.target.value);
                clearTranslation();
              }}
              onKeyDown={handleTranslate}
              className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm"
              placeholder="按下 Enter 翻译文本"
              rows={3}
            />
            {isLoading && <InlineLoadingSpinner position="absolute bottom-2 right-1" />}
          </div>
          {!wordEntry && !translatedText && !error && (
            <div className="space-y-3 rounded-lg border border-gray-200 p-4">
              <ToggleSwitch
                label="划词翻译"
                checked={wordTranslation}
                onChange={globalConfigStorage.toggleWordTranslation}
              />
            </div>
          )}
        </div>
        {wordEntry && (
          <div className="mx-5 -mt-1 mb-6 rounded-lg border border-gray-200 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">{wordEntry.word}</h3>
                {wordEntry.phonetic && <span className="text-gray-500">/{wordEntry.phonetic}/</span>}
              </div>
              {wordEntry.translation && (
                <div className="text-gray-700">
                  <span className="font-medium">释义：</span>
                  {wordEntry.translation}
                </div>
              )}
              {wordEntry.definition && (
                <div className="text-gray-700">
                  <span className="font-medium">英文释义：</span>
                  {wordEntry.definition}
                </div>
              )}
              {wordEntry.pos && (
                <div className="text-gray-700">
                  <span className="font-medium">词性：</span>
                  {wordEntry.pos}
                </div>
              )}
              {wordEntry.tag && (
                <div className="text-gray-700">
                  <span className="font-medium">标签：</span>
                  {wordEntry.tag}
                </div>
              )}
            </div>
          </div>
        )}
        {!wordEntry && translatedText && (
          <div className="mx-5 -mt-1 mb-6 rounded-lg border border-gray-200">
            <TranslationStatusCard type="success" title="腾讯翻译" message={translatedText} />
          </div>
        )}
        {!wordEntry && error && (
          <div className="mx-5 -mt-1 mb-6 rounded-lg border border-gray-200">
            <TranslationStatusCard type="error" title="腾讯翻译" message={error} />
          </div>
        )}
      </div>

      <footer className="mt-auto flex items-center justify-between border-t border-gray-200 px-5 py-3 text-xs text-gray-500">
        <span>v0.5.0</span>
        <div className="text-gray-400">专注翻译 · 简洁高效</div>
      </footer>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
