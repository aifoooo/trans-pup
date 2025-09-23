import { tencentTranslatorConfigStorage } from '@extension/storage';
import EditableField from '@src/components/EditableField';
import { useState, useEffect } from 'react';
import { RiQuestionnaireLine } from 'react-icons/ri';

const GeneralSettings = () => {
  const [secretId, setSecretId] = useState('');
  const [secretKey, setSecretKey] = useState('');

  // 加载已保存的配置并在配置变化时更新界面
  useEffect(() => {
    // 定义加载配置的函数
    const loadConfig = async () => {
      const config = tencentTranslatorConfigStorage.getSnapshot();
      if (config) {
        setSecretId(config.secretId || '');
        setSecretKey(config.secretKey || '');
      }
    };

    // 初始加载配置
    loadConfig();

    // 订阅配置变化，当存储中的配置发生变化时更新组件状态
    // subscribe 方法返回一个取消订阅的函数
    const unsubscribe = tencentTranslatorConfigStorage.subscribe(() => {
      const config = tencentTranslatorConfigStorage.getSnapshot();
      if (config) {
        setSecretId(config.secretId || '');
        setSecretKey(config.secretKey || '');
      }
    });

    // 组件卸载时取消订阅，防止内存泄漏
    return () => {
      unsubscribe();
    };
  }, []);

  const handleSecretIdSave = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await tencentTranslatorConfigStorage.saveSecretId(secretId);
    }
  };

  const handleSecretKeySave = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await tencentTranslatorConfigStorage.saveSecretKey(secretKey);
    }
  };

  return (
    <div>
      <h2 className="mb-4 items-center text-left text-base">翻译服务</h2>
      <form className="mb-8 flex flex-col rounded-lg border border-gray-200 px-8 pb-8 pt-6 shadow-md">
        <label className="mb-4 flex items-center text-base" htmlFor="title">
          <span>腾讯翻译</span>
          <a
            href="https://cloud.tencent.com/document/product/551/104415"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 cursor-pointer text-gray-500 hover:text-blue-500"
            title="查看如何申请">
            <RiQuestionnaireLine />
          </a>
        </label>
        <div className="flex flex-col gap-2">
          <EditableField
            label="SecretId"
            id="secretId"
            value={secretId}
            onChange={setSecretId}
            onSave={handleSecretIdSave}
            masked={false}
          />
          <EditableField
            label="SecretKey"
            id="secretKey"
            value={secretKey}
            onChange={setSecretKey}
            onSave={handleSecretKeySave}
            masked={true}
          />
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;
