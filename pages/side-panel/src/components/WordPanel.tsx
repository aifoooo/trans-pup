import type { WordEntry } from '@extension/dictionary';
import type React from 'react';

// 创建一个映射对象，将英文tag转换为中文
const tagMap: Record<string, string> = {
  zk: '中考',
  gk: '高考',
  cet4: '四级',
  cet6: '六级',
  ky: '考研',
  toefl: '托福',
  ielts: '雅思',
  gre: 'GRE',
};

const WordPanel: React.FC<{ entry: WordEntry }> = ({ entry }) => (
  <div className="border-t border-gray-200 p-4">
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-1">
        {entry.tag &&
          entry.tag.split(' ').map((part, index) => (
            <span key={index} className="rounded-md border border-red-500 px-1 text-xs text-red-500">
              {tagMap[part] || part}
            </span>
          ))}
        {entry.collins && entry.collins > 0 && (
          <span className="rounded-md border border-violet-500 px-1 text-xs text-violet-500">
            柯林斯:{entry.collins}
          </span>
        )}
        {entry.oxford && entry.oxford > 0 && (
          <span className="rounded-md border border-orange-500 px-1 text-xs text-orange-500">牛津3000</span>
        )}
        {entry.bnc && entry.bnc > 0 && (
          <span className="rounded-md border border-blue-500 px-1 text-xs text-blue-500">BNC:{entry.bnc}</span>
        )}
        {entry.frq && entry.frq > 0 && (
          <span className="rounded-md border border-blue-500 px-1 text-xs text-blue-500">FRQ:{entry.frq}</span>
        )}
      </div>
      <div className="flex items-center space-x-1">
        <span className="text-base font-bold">{entry.word}</span>
        <span className="text-sm text-gray-500">{entry.phonetic ? `[${entry.phonetic}]` : ''}</span>
      </div>
      <div className="flex items-center">
        <pre className="whitespace-pre-wrap text-sm text-gray-500">{entry.translation || ''}</pre>
      </div>
    </div>
  </div>
);

export default WordPanel;
