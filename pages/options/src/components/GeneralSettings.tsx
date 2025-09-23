import EditableField from '@src/components/EditableField';
import { useState } from 'react';
import { RiQuestionnaireLine } from 'react-icons/ri';

const GeneralSettings = () => {
  const [secretId, setSecretId] = useState('');
  const [secretKey, setSecretKey] = useState('');

  const handleSecretIdSave = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 可以在这里添加保存逻辑
    }
  };

  const handleSecretKeySave = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // 可以在这里添加保存逻辑
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
