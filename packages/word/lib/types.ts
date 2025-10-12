export interface WordEntry {
  word: string;
  phonetic: string;
  definition: string;
  translation: string;
  pos: string;
  collins: number;
  oxford: number;
  tag: string;
  bnc: number;
  frq: number;
  exchange: string;
}

export interface WordDictionary {
  f: string[];
  d: (string | number)[][];
}

export interface WordQueryResult {
  found: boolean;
  entry?: WordEntry;
}
