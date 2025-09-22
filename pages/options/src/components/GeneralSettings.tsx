import { RiQuestionnaireLine } from '@react-icons/all-files/ri/RiQuestionnaireLine';
import EditableField from '@src/components/EditableField';
import { useState } from 'react';

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
      <h2 className="mb-4 flex items-center justify-between text-left text-base">
        <div className="flex items-center space-x-1">
          <span>腾讯翻译</span>
          <a
            href="https://cloud.tencent.com/document/product/551/104415"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer text-gray-500 hover:text-blue-500"
            title="申请腾讯 SecretKey">
            <RiQuestionnaireLine />
          </a>
        </div>
      </h2>
      <form className="mb-8 flex flex-col rounded-lg border border-gray-200 px-8 pb-8 pt-6 shadow-md">
        <EditableField
          value={secretId}
          onChange={setSecretId}
          label="SecretId"
          id="name"
          masked={false}
          onSave={handleSecretIdSave}
        />
        <EditableField
          value={secretKey}
          onChange={setSecretKey}
          label="SecretKey"
          id="email"
          masked={true}
          onSave={handleSecretKeySave}
        />
      </form>
    </div>
  );
};

export default GeneralSettings;
