import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { globalConfigStorage, tencentTranslatorConfigStorage } from '@extension/storage';
import { createTranslator, translator } from '@extension/translator';
import { ErrorDisplay, ToggleSwitch, LoadingSpinner, InlineLoadingSpinner } from '@extension/ui';
import TranslationStatusCard from '@src/components/TranslationStatusCard';
import { useState, useRef, useEffect } from 'react';
import { IoSettingsOutline } from 'react-icons/io5';

const Popup = () => {
  const logo = chrome.runtime.getURL('icon-34.png');

  // 状态变量
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setHasTranslator] = useState(false);

  // 引用变量
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 配置状态
  const { autoAnnotation, autoCollection, wordTranslation } = useStorage(globalConfigStorage);

  // 检查是否存在有效的翻译器配置
  // 该副作用用于在组件挂载时检查翻译服务的可用性
  // 主要检查两个方面：
  // 1. 全局 translator 实例是否已创建
  // 2. 用户是否配置了腾讯云翻译服务的凭证
  // 如果任一条件满足，则设置 hasTranslator 状态为 true，表示翻译功能可用
  useEffect(() => {
    const checkTranslator = async () => {
      // 检查全局 translator 实例是否已存在
      // 这个实例在应用启动时可能已经创建好了
      if (translator) {
        setHasTranslator(true);
        return;
      }

      // 如果全局 translator 实例不存在，则检查用户配置
      // 获取存储中的腾讯云翻译配置
      const config = tencentTranslatorConfigStorage.getSnapshot();
      // 检查配置中是否包含有效的密钥信息
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

      // 清除之前的翻译信息
      setTranslatedText('');
      setError('');

      // 检查输入文本是否为空
      if (!inputText.trim()) {
        return;
      }

      // 确定要使用的翻译器实例
      let translatorToUse = translator;
      if (!translatorToUse) {
        // 再次尝试创建翻译器实例
        translatorToUse = createTranslator();
        if (!translatorToUse) {
          setError('请先配置腾讯云翻译服务的 SecretId 和 SecretKey');
          return;
        }
      }

      try {
        setIsLoading(true);

        // 检测源语言
        const sourceLanguage = await translatorToUse.detect(inputText);

        // 翻译文本（源语言是中文时翻译成英文，源语言不是中文时翻译成中文）
        const result = await translatorToUse.translate(
          inputText,
          sourceLanguage,
          sourceLanguage === 'zh' ? 'en' : 'zh',
        );

        setTranslatedText(result);
      } catch (err) {
        console.error('Translation error:', err);
        setError(err instanceof Error ? err.message : '翻译失败');
      } finally {
        setIsLoading(false);
      }
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
                setTranslatedText('');
                setError('');
              }}
              onKeyDown={handleTranslate}
              className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 text-sm"
              placeholder="翻译文本"
              rows={2}
            />
            {isLoading && <InlineLoadingSpinner />}
          </div>
          {!translatedText && !error && (
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
        {error && <TranslationStatusCard type="error" title="腾讯翻译" message={error} />}
        {translatedText && <TranslationStatusCard type="success" title="腾讯翻译" message={translatedText} />}
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
              console.error('打开单词本失败:', error);
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
