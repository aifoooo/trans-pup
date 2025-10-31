import type { COLORS } from './const.js';
import type { TupleToUnion } from 'type-fest';

export type * from 'type-fest';
export type ColorType = 'success' | 'info' | 'error' | 'warning' | keyof typeof COLORS;
export type ExcludeValuesFromBaseArrayType<B extends string[], E extends (string | number)[]> = Exclude<
  TupleToUnion<B>,
  TupleToUnion<E>
>[];
export type ManifestType = chrome.runtime.ManifestV3;

/**
 * 选中文本信息
 * 用于划词翻译功能，在 content script 和 content ui 之间传递选中文本的信息
 */
export interface SelectionInfo {
  text: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
