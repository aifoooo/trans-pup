import '@src/Popup.css';
import { useStorage, useTranslation, withErrorBoundary, withSuspense } from '@extension/shared';
import { globalConfigStorage, tencentTranslatorConfigStorage, vocabularyStorage } from '@extension/storage';
import {
  ErrorDisplay,
  ToggleSwitch,
  LoadingSpinner,
  InlineLoadingSpinner,
  TranslationStatusCard,
  WordPanel,
} from '@extension/ui';
import { useState, useRef, useEffect, useCallback } from 'react';
import { IoSettingsOutline } from 'react-icons/io5';
import type { WordStatus } from '@extension/storage';

const Popup = () => {
  const logo = chrome.runtime.getURL('icon-34.png');

  // 状态变量
  const [inputText, setInputText] = useState('');
  const [, setHasTranslator] = useState(false);

  // 引用变量
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 配置状态
  const { autoAnnotation, autoCollection, wordTranslation } = useStorage(globalConfigStorage);

  // 使用翻译 hook（popup 环境，直接使用 vocabularyStorage）
  const {
    loading: isLoading,
    wordEntry: localWordEntry,
    translatedText,
    error,
    wordStatus: currentWordStatus,
    translate: translateText,
    clear: clearTranslation,
    updateWordStatus,
  } = useTranslation({
    useMessageForWordStatus: false,
    vocabularyStorage,
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

  // 处理单词删除
  const handleRemoveWord = useCallback(
    async (word: string) => {
      try {
        await vocabularyStorage.removeWord(word);
        console.log('[Popup] Word removed:', word);
        // 只更新状态，不重新翻译
        await updateWordStatus(word);
      } catch (error) {
        console.error('[Popup] Failed to remove word:', error);
      }
    },
    [updateWordStatus],
  );

  // 处理单词状态改变
  const handleStatusChange = useCallback(
    async (word: string, newStatus: WordStatus) => {
      try {
        // 如果单词不在列表中，需要先添加单词
        if (currentWordStatus === null) {
          await vocabularyStorage.addWord(word);
          console.log('[Popup] Word added:', word);
        }

        // 更新单词状态
        await vocabularyStorage.updateWordStatus(word, newStatus);
        console.log('[Popup] Word status updated:', word, '->', newStatus);

        // 只更新状态，不重新翻译
        await updateWordStatus(word);
      } catch (error) {
        console.error('[Popup] Failed to update word status:', error);
      }
    },
    [currentWordStatus, updateWordStatus],
  );

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
              rows={2}
            />
            {isLoading && <InlineLoadingSpinner position="absolute bottom-2 right-1" />}
          </div>
          {!localWordEntry && !translatedText && !error && (
            <div className="space-y-3 rounded-lg border border-gray-200 p-4">
              <ToggleSwitch
                label="自动收集"
                checked={autoCollection}
                onChange={globalConfigStorage.toggleAutoCollection}
              />
              <ToggleSwitch
                label="自动标注"
                checked={autoAnnotation}
                onChange={globalConfigStorage.toggleAutoAnnotation}
              />
              <ToggleSwitch
                label="划词翻译"
                checked={wordTranslation}
                onChange={globalConfigStorage.toggleWordTranslation}
              />
            </div>
          )}
        </div>
        {localWordEntry && (
          <div className="mx-5 -mt-1 mb-6 rounded-lg border border-gray-200">
            <WordPanel
              entry={localWordEntry}
              showTags={false}
              showExchanges={false}
              currentStatus={currentWordStatus}
              onRemove={() => handleRemoveWord(localWordEntry.word)}
              onStatusChange={newStatus => handleStatusChange(localWordEntry.word, newStatus)}
            />
          </div>
        )}
        {translatedText && (
          <div className="mx-5 -mt-1 mb-6 rounded-lg border border-gray-200">
            <TranslationStatusCard type="success" title="腾讯翻译" message={translatedText} />
          </div>
        )}
        {error && (
          <div className="mx-5 -mt-1 mb-6 rounded-lg border border-gray-200">
            <TranslationStatusCard type="error" title="腾讯翻译" message={error} />
          </div>
        )}
      </div>

      <footer className="mt-auto flex items-center justify-between border-t border-gray-200 px-5 py-3 text-xs text-gray-500">
        <span>v0.5.0</span>
        <button
          onClick={async () => {
            try {
              // 获取当前标签页信息
              const [tab] = await chrome.tabs.query({
                active: true,
                currentWindow: true,
              });

              if (!tab?.id) {
                throw new Error('无法获取当前标签页信息');
              }

              // 打开侧边栏
              await chrome.sidePanel.open({ tabId: tab.id });
            } catch (error) {
              console.error('[popup] 打开单词本失败:', error);
              alert(`打开单词本失败: ${error instanceof Error ? error.message : '未知错误'}`);
            }
          }}
          className="rounded-full border border-blue-500 px-1.5 py-0.5 font-semibold text-blue-500 hover:bg-gray-100">
          单词本
        </button>
      </footer>
    </div>
  );
};

export default withErrorBoundary(withSuspense(Popup, <LoadingSpinner />), ErrorDisplay);
