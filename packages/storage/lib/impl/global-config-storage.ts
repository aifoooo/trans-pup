import { createStorage, StorageEnum } from '../base/index.js';
import type { GlobalConfigStateType, GlobalConfigStorageType } from '../base/index.js';

const storage = createStorage<GlobalConfigStateType>(
  'global-config-storage-key',
  {
    wordTranslation: true,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const globalConfigStorage: GlobalConfigStorageType = {
  ...storage,
  toggleWordTranslation: async () => {
    await storage.set(prev => ({
      ...prev,
      wordTranslation: !prev.wordTranslation,
    }));
  },
};
