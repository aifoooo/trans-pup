import type { BaseStorageType } from './index.js';

export interface TencentTranslatorConfigStateType {
  secretId: string;
  secretKey: string;
}

export type TencentTranslatorConfigStorageType = BaseStorageType<TencentTranslatorConfigStateType> & {
  saveSecretId: (secretId: string) => Promise<void>;
  saveSecretKey: (secretKey: string) => Promise<void>;
};
