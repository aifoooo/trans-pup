import { createStorage, StorageEnum } from '../base/index.js';
import type { GlobalConfigStateType, GlobalConfigStorageType } from '../base/index.js';

const storage = createStorage<GlobalConfigStateType>(
  'global-config-storage-key',
  {
    autoCollection: true,
    autoAnnotation: true,
    wordTranslation: true,
  },
  {
    storageEnum: StorageEnum.Local,
    liveUpdate: true,
  },
);

export const globalConfigStorage: GlobalConfigStorageType = {
  ...storage,
  toggleAutoCollection: async () => {
    await storage.set(prev => ({
      ...prev,
      autoCollection: !prev.autoCollection,
    }));
  },
  toggleAutoAnnotation: async () => {
    await storage.set(prev => ({
      ...prev,
      autoAnnotation: !prev.autoAnnotation,
    }));
  },
  toggleWordTranslation: async () => {
    await storage.set(prev => ({
      ...prev,
      wordTranslation: !prev.wordTranslation,
    }));
  },
};
