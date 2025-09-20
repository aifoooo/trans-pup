export interface TranslatorInterface {
  /**
   * 检测语种
   * @param text 待检测文本
   * @returns 语种
   */
  detect: (text: string) => Promise<string>;
  /**
   * 翻译文本
   * @param text 待翻译文本
   * @param source 源语种
   * @param target 目标语种
   * @returns 翻译结果
   */
  translate: (text: string, source: string, target: string) => Promise<string>;
}
