import { createStorage, StorageEnum } from '../base/index.js';
import type { TencentTranslatorConfigStateType, TencentTranslatorConfigStorageType } from '../base/index.js';

const storage = createStorage<TencentTranslatorConfigStateType>(
  'tencent-translator-config-storage-key',
  {
    secretId: '',
    secretKey: '',
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const tencentTranslatorConfigStorage: TencentTranslatorConfigStorageType = {
  ...storage,
  saveSecretId: async (secretId: string) => {
    await storage.set(currentState => ({
      ...currentState,
      secretId,
    }));
  },
  saveSecretKey: async (secretKey: string) => {
    await storage.set(currentState => ({
      ...currentState,
      secretKey,
    }));
  },
};
