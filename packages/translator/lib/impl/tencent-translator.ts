import * as tencentcloud from 'tencentcloud-sdk-nodejs-tmt';
import type { TranslatorInterface } from '../base/index.js';

// 腾讯云翻译客户端
const TmtClient = tencentcloud.tmt.v20180321.Client;

export class TencentTranslator implements TranslatorInterface {
  private client: InstanceType<typeof TmtClient>;

  constructor(secretId: string, secretKey: string, region: string = 'ap-guangzhou') {
    // 验证参数
    if (!secretId || !secretKey) {
      throw new Error('secretId and secretKey are required');
    }

    const clientConfig = {
      credential: {
        secretId: secretId,
        secretKey: secretKey,
      },
      region: region,
      profile: {
        httpProfile: {
          endpoint: 'tmt.tencentcloudapi.com',
        },
      },
    };

    this.client = new TmtClient(clientConfig);
  }

  /**
   * 检测语种
   * @param text 待检测文本
   * @returns 语种
   */
  async detect(text: string): Promise<string> {
    // 处理空文本
    if (!text.trim()) {
      throw new Error('Text to detect cannot be empty');
    }

    try {
      const params = {
        Text: text,
        ProjectId: 0,
      };

      const result = await this.client.LanguageDetect(params);
      return result.Lang || '';
    } catch (error) {
      let errorMessage = 'Language detection failed';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      } else if (typeof error === 'object' && error && 'message' in error) {
        errorMessage += `: ${String(error.message)}`;
      }
      throw new Error(errorMessage);
    }
  }

  /**
   * 翻译文本
   * @param text 待翻译文本
   * @param source 源语种
   * @param target 目标语种
   * @returns 翻译结果
   */
  async translate(text: string, source: string, target: string): Promise<string> {
    // 处理空文本
    if (!text.trim()) {
      return text;
    }

    // 验证语言参数
    if (!source || !target) {
      throw new Error('Source and target languages are required');
    }

    try {
      const params = {
        SourceText: text,
        Source: source,
        Target: target,
        ProjectId: 0,
      };

      const result = await this.client.TextTranslate(params);
      return result.TargetText || '';
    } catch (error) {
      let errorMessage = 'Translation failed';
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
      } else if (typeof error === 'object' && error && 'message' in error) {
        errorMessage += `: ${String(error.message)}`;
      }
      throw new Error(errorMessage);
    }
  }
}
