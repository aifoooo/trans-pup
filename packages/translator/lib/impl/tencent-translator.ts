import CryptoJS from 'crypto-js';
import type { TranslatorInterface } from '../base/index.js';

interface TencentAPIResponse {
  Response: {
    Lang?: string;
    TargetText?: string;
    Source?: string;
    Target?: string;
    RequestId?: string;
    Error?: {
      Code?: string;
      Message?: string;
    };
    [key: string]: string | number | boolean | object | undefined;
  };
}

export class TencentTranslator implements TranslatorInterface {
  private secretId: string;
  private secretKey: string;
  private region: string;

  constructor(secretId: string, secretKey: string, region: string = 'ap-guangzhou') {
    this.secretId = secretId;
    this.secretKey = secretKey;
    this.region = region;
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
      const action = 'LanguageDetect';
      const params = {
        Text: text,
        ProjectId: 0,
      };

      const result = await this.callTencentAPI(action, params);
      return result.Response.Lang || '';
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
      const action = 'TextTranslate';
      const params = {
        SourceText: text,
        Source: source,
        Target: target,
        ProjectId: 0,
      };

      const result = await this.callTencentAPI(action, params);
      return result.Response.TargetText || '';
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

  /**
   * 调用腾讯云API
   * @param action API动作
   * @param params 请求参数
   * @returns 响应结果
   */
  private async callTencentAPI(action: string, params: Record<string, unknown>): Promise<TencentAPIResponse> {
    const endpoint = 'tmt.tencentcloudapi.com';
    const service = 'tmt';
    const version = '2018-03-21';

    const timestamp = Math.floor(Date.now() / 1000);

    // 构造请求参数
    const payload = JSON.stringify(params);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      Host: endpoint,
      'X-TC-Action': action,
      'X-TC-Version': version,
      'X-TC-Timestamp': timestamp.toString(),
      'X-TC-Region': this.region,
    };

    // ************* 步骤 1：拼接规范请求串 *************
    const signedHeaders = 'content-type;host';
    const hashedRequestPayload = CryptoJS.SHA256(payload).toString(CryptoJS.enc.Hex);
    const httpRequestMethod = 'POST';
    const canonicalUri = '/';
    const canonicalQueryString = '';
    const canonicalHeaders =
      'content-type:' + headers['Content-Type'].trim() + '\n' + 'host:' + headers['Host'].trim() + '\n';

    const canonicalRequest =
      httpRequestMethod +
      '\n' +
      canonicalUri +
      '\n' +
      canonicalQueryString +
      '\n' +
      canonicalHeaders +
      '\n' +
      signedHeaders +
      '\n' +
      hashedRequestPayload;

    // ************* 步骤 2：拼接待签名字符串 *************
    const algorithm = 'TC3-HMAC-SHA256';

    const date = new Date(timestamp * 1000);
    const year = date.getUTCFullYear().toString();
    const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
    const day = date.getUTCDate().toString().padStart(2, '0');
    const dateStr = year + '-' + month + '-' + day;

    const hashedCanonicalRequest = CryptoJS.SHA256(canonicalRequest).toString(CryptoJS.enc.Hex);
    const credentialScope = dateStr + '/' + service + '/' + 'tc3_request';
    const stringToSign = algorithm + '\n' + timestamp + '\n' + credentialScope + '\n' + hashedCanonicalRequest;

    // ************* 步骤 3：计算签名 *************
    const kDate = CryptoJS.HmacSHA256(dateStr, 'TC3' + this.secretKey);
    const kService = CryptoJS.HmacSHA256(service, kDate);
    const kSigning = CryptoJS.HmacSHA256('tc3_request', kService);
    const signature = CryptoJS.HmacSHA256(stringToSign, kSigning).toString(CryptoJS.enc.Hex);

    // ************* 步骤 4：拼接 Authorization *************
    const authorization =
      algorithm +
      ' ' +
      'Credential=' +
      this.secretId +
      '/' +
      credentialScope +
      ', ' +
      'SignedHeaders=' +
      signedHeaders +
      ', ' +
      'Signature=' +
      signature;

    headers['Authorization'] = authorization;

    // ************* 步骤 5：构造并发起请求 *************
    // 发送请求
    const response = await fetch(`https://${endpoint}`, {
      method: 'POST',
      headers,
      body: payload,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TencentAPIResponse = await response.json();

    if (data.Response && data.Response.Error) {
      throw new Error(data.Response.Error.Message || 'API call failed');
    }

    return data;
  }
}
