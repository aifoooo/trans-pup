import '@src/Popup.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { globalConfigStorage, tencentTranslatorConfigStorage } from '@extension/storage';
import { createTranslator, translator } from '@extension/translator';
import { ErrorDisplay, ToggleSwitch, LoadingSpinner } from '@extension/ui';
import { useState, useRef, useEffect } from 'react';
import { IoSettingsOutline } from 'react-icons/io5';

const Popup = () => {
  const { autoAnnotation, autoCollection, wordTranslation } = useStorage(globalConfigStorage);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [, setHasTranslator] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 检查是否存在有效的翻译器配置
  useEffect(() => {
    const checkTranslator = async () => {
      // 检查当前 translator 是否存在
      if (translator) {
        setHasTranslator(true);
        return;
      }

      // 如果当前 translator 不存在，检查配置
      const config = tencentTranslatorConfigStorage.getSnapshot();
      const hasValidConfig =
        config &&
        config.secretId &&
        config.secretId.trim() !== '' &&
        config.secretKey &&
        config.secretKey.trim() !== '';

      const hasEnvVars = process.env.TENCENTCLOUD_SECRET_ID && process.env.TENCENTCLOUD_SECRET_KEY;

      setHasTranslator(!!(hasValidConfig || hasEnvVars));
    };

    checkTranslator();
  }, []);

  const handleTranslate = async (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      // 清除之前的错误信息
      setError('');

      // 检查输入文本是否为空
      if (!inputText.trim()) {
        setError('请输入要翻译的文本');
        return;
      }

      // 检查翻译器是否可用
      if (!translator) {
        // 再次尝试创建翻译器实例
        const newTranslator = createTranslator();
        if (!newTranslator) {
          setError('请先配置腾讯云翻译服务的 SecretId 和 SecretKey');
          return;
        }
        // 如果创建成功，使用新创建的翻译器
        try {
          setIsLoading(true);

          // 检测源语言
          const sourceLanguage = await newTranslator.detect(inputText);

          // 翻译文本（源语言是中文时翻译成英文，源语言不是中文时翻译成中文）
          const result = await newTranslator.translate(
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
        return;
      }

      try {
        setIsLoading(true);

        // 检测源语言
        const sourceLanguage = await translator.detect(inputText);

        // 翻译文本（源语言是中文时翻译成英文，源语言不是中文时翻译成中文）
        const result = await translator.translate(inputText, sourceLanguage, sourceLanguage === 'zh' ? 'en' : 'zh');

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
        <div className="space-y-4 px-6 py-5">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              onKeyDown={handleTranslate}
              className="w-full resize-none rounded-lg bg-gray-100 p-4 text-sm hover:bg-gray-200 focus:bg-gray-100"
              placeholder="按下 Enter 翻译文本框内文本"
              rows={2}
            />
            {isLoading && (
              <div className="absolute bottom-2 right-2">
                <LoadingSpinner />
              </div>
            )}
          </div>
          {error && <div className="px-2 text-sm text-red-500">{error}</div>}
          {translatedText && <div className="rounded-lg bg-gray-100 p-4 text-sm">{translatedText}</div>}
          <div className="space-y-3 rounded-lg bg-gray-100 p-4">
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
