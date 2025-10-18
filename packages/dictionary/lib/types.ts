export interface WordEntry {
  word: string;
  phonetic: string;
  definition: string;
  translation: string;
  pos: string;
  collins: string | number;
  oxford: string | number;
  tag: string;
  bnc: string | number;
  frq: string | number;
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
