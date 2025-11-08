/**
 * 位置信息
 * 用于表示页面上的坐标位置
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * 选中文本信息
 * 用于划词翻译功能，在 content script 和 content ui 之间传递选中文本的信息
 */
export interface SelectionInfo {
  text: string;
  position: Position;
}
