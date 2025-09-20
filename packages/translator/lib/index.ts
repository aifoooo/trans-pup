import { TencentTranslator } from '../lib/impl/index.js';

export const translator = new TencentTranslator(
  process.env.TENCENTCLOUD_SECRET_ID as string,
  process.env.TENCENTCLOUD_SECRET_KEY as string,
);
