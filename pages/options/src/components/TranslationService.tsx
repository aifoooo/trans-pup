import { tencentTranslatorConfigStorage } from '@extension/storage';
import EditableInputFieldSet from '@src/components/EditableInputFieldSet';
import { useState, useEffect } from 'react';
import { RiQuestionnaireLine } from 'react-icons/ri';

const TranslationService = () => {
  const [tencentSecretId, setTencentSecretId] = useState('');
  const [tencentSecretKey, setTencentSecretKey] = useState('');

  // 加载已保存的配置并在配置变化时更新界面
  useEffect(() => {
    // 定义加载配置的函数
    const loadConfig = async () => {
      const config = tencentTranslatorConfigStorage.getSnapshot();
      if (config) {
        setTencentSecretId(config.secretId || '');
        setTencentSecretKey(config.secretKey || '');
      }
    };

    // 初始加载配置
    loadConfig();

    // 订阅配置变化，当存储中的配置发生变化时更新组件状态
    // subscribe 方法返回一个取消订阅的函数
    const unsubscribe = tencentTranslatorConfigStorage.subscribe(() => {
      const config = tencentTranslatorConfigStorage.getSnapshot();
      if (config) {
        setTencentSecretId(config.secretId || '');
        setTencentSecretKey(config.secretKey || '');
      }
    });

    // 组件卸载时取消订阅，防止内存泄漏
    return () => {
      unsubscribe();
    };
  }, []);

  const saveTencentSecretId = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await tencentTranslatorConfigStorage.saveSecretId(tencentSecretId);
    }
  };

  const saveTencentSecretIdOnBlur = async () => {
    await tencentTranslatorConfigStorage.saveSecretId(tencentSecretId);
  };

  const saveTencentSecretKey = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await tencentTranslatorConfigStorage.saveSecretKey(tencentSecretKey);
    }
  };

  const saveTencentSecretKeyOnBlur = async () => {
    await tencentTranslatorConfigStorage.saveSecretKey(tencentSecretKey);
  };

  return (
    <div>
      <h2 className="mb-4 items-center text-left text-base">翻译服务</h2>
      <form className="mb-8 flex flex-col rounded-lg border border-gray-200 px-8 pb-8 pt-6 shadow-md">
        <label className="mb-4 flex items-center text-base" htmlFor="title">
          <img
            src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACNklEQVR4AezTA+wcQRTH8fkbQW0jrq2gCGvbtts4qWK7NqLatm3b5vnu9ZtkLpnsaXdrTPI57pvfWzwlIr/U/wZ+eQPO1jjJw2Csw1OEEMZzbMBg5KvvuMzwPngGSeElBn7P4CwsgsThgwcSx0Jkfo8GFkMMdzAKZY1jymI07kIMi741vCfEMB+5SY7PjdNwH7fh2XgK0ebZrEuzNPEcOW4fOtEeIs/htNzDdexHUzcNrIZoU1zUpylX6/jtGpilVr04gctq0euzauujOfxW2vYey6U0pmE9DmAjZqFGsuBCWANJIICZyEwSnIWZCEASWINC1vBSuAGxYS+KxAnPx3aIDTdQKhqehkMQLYIVaINa6IGDEMMtVDHCi+EkxHAQ3VALbbAcEYh2CGmKjTpAtBDaK2MZTU5GGKKdM8IvQQzTkRbnKrVHCKJ1UGy0EaLNTvGAtocHj1GVDcriFkQLY0CKB3Q2RNuo2OgNRCtvY0rq6vBKuA3RAuhqY0LKQ7Q3ygj3OxizqnhsCW/noN4P6kDwJ4hW0EZxdTyBaB60chBeEKJ9UpYJGGEj/JW5AVooJ2u5jFDmJBA6BqK9RtUEhQ3xHqJ9QEOH4VXxGqKNUQTm4j5Ee4XRKGEUNsMHiPYKDRwEl8Boy9W7j9zok90YHoiFRx25d0mtDHssc+7He5s8EAsPGlvHqx7uQaIIv6lWhbxG4fdwD3UTzXguhmMX4efMM/9Gr7ATI/F1yI2Tge8XjDpg1AEAsMEBDrhlyj8AAAAASUVORK5CYII="
            alt="腾讯云"
            className="mr-1 h-5 w-5 rounded-full border border-gray-300 p-0.5"
          />
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
          <EditableInputFieldSet
            id="tencentSecretId"
            label="SecretId"
            value={tencentSecretId}
            onChange={setTencentSecretId}
            masked={false}
            onSave={saveTencentSecretId}
            onBlurSave={saveTencentSecretIdOnBlur}
          />
          <EditableInputFieldSet
            id="tencentSecretKey"
            label="SecretKey"
            value={tencentSecretKey}
            onChange={setTencentSecretKey}
            masked={true}
            onSave={saveTencentSecretKey}
            onBlurSave={saveTencentSecretKeyOnBlur}
          />
        </div>
      </form>
    </div>
  );
};

export default TranslationService;
