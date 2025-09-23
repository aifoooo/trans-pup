import { TencentTranslator } from './impl/tencent-translator.js';
import { tencentTranslatorConfigStorage } from '@extension/storage';
import type { TranslatorInterface } from './base/index.js';

export const createTranslator = (): TranslatorInterface | null => {
  // 1. 用户配置（最高优先级）
  let secretId: string | undefined;
  let secretKey: string | undefined;
  const storageState = tencentTranslatorConfigStorage.getSnapshot();
  if (storageState) {
    if (storageState.secretId && storageState.secretId.trim() !== '') {
      secretId = storageState.secretId;
    }
    if (storageState.secretKey && storageState.secretKey.trim() !== '') {
      secretKey = storageState.secretKey;
    }
  }

  // 2. 环境变量（次优先级）
  if (!secretId || !secretKey || secretId.trim() === '' || secretKey.trim() === '') {
    secretId = secretId || process.env.TENCENTCLOUD_SECRET_ID;
    secretKey = secretKey || process.env.TENCENTCLOUD_SECRET_KEY;
  }

  // 验证参数
  if (!secretId || !secretKey || secretId.trim() === '' || secretKey.trim() === '') {
    // 如果没有配置，返回 null 而不是抛出错误
    return null;
  }

  return new TencentTranslator(secretId, secretKey);
};

export const translator = createTranslator();
