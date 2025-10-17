import '@src/components/WordPanel.css';
import { FaVolumeUp } from 'react-icons/fa';
import type { WordEntry } from '@extension/dictionary';
import type React from 'react';

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

const exchangeMap: Record<string, string> = {
  p: '过去式',
  d: '过去分词',
  i: '现在分词',
  '3': '第三人称单数',
  r: '比较级',
  t: '最高级',
  s: '复数',
};

const WordPanel: React.FC<{ entry: WordEntry }> = ({ entry }) => (
  <div className="border-t border-gray-200 p-4">
    <div className="space-y-4">
      <div className="scrollbar-hide flex cursor-default items-center gap-1 overflow-auto">
        {entry.tag &&
          entry.tag.split(' ').map((part, index) => (
            <span
              key={index}
              className="whitespace-nowrap rounded-md bg-rose-500 px-1.5 py-0.5 text-xs font-semibold text-white">
              {tagMap[part] || part}
            </span>
          ))}
        {entry.collins && entry.collins > 0 && (
          <span className="whitespace-nowrap rounded-md bg-violet-500 px-1.5 py-0.5 text-xs font-semibold text-white">
            柯林斯:{entry.collins}
          </span>
        )}
        {entry.oxford && entry.oxford > 0 && (
          <span className="whitespace-nowrap rounded-md bg-orange-500 px-1.5 py-0.5 text-xs font-semibold text-white">
            牛津3000
          </span>
        )}
        {entry.bnc && entry.bnc > 0 && (
          <span className="whitespace-nowrap rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-500">
            BNC:{entry.bnc}
          </span>
        )}
        {entry.frq && entry.frq > 0 && (
          <span className="whitespace-nowrap rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-500">
            FRQ:{entry.frq}
          </span>
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-lg font-bold">{entry.word}</span>
        {entry.phonetic && (
          <div className="flex items-center gap-3">
            <div className="text-sm italic text-gray-500">[{entry.phonetic}]</div>
            <span className="inline-flex items-center gap-0.5 text-xs text-blue-500">
              英<FaVolumeUp className="h-3 w-3" title="英式发音" />
            </span>
            <span className="inline-flex items-center gap-0.5 text-xs text-red-500">
              美<FaVolumeUp className="h-3 w-3" title="美式发音" />
            </span>
          </div>
        )}
      </div>
      <div className="text-sm text-gray-700">
        {entry.translation &&
          entry.translation
            .split('\n')
            .filter(part => part.trim() !== '')
            .map((part, index) => {
              // 匹配词性或专业前缀，如 n. [计] 等
              const prefixRegex = /(\[[^\]]+\]|(?:^|\s)([a-zA-Z]+\.)(?:\s|$))/g;
              const parts = [];
              let lastIndex = 0;
              let match;

              // 查找所有前缀
              while ((match = prefixRegex.exec(part)) !== null) {
                // 添加前缀前的文本（如果有）
                if (match.index > lastIndex) {
                  parts.push(part.substring(lastIndex, match.index));
                }
                // 添加前缀本身
                parts.push(match[0]);
                lastIndex = match.index + match[0].length;
              }

              // 添加剩余的文本
              if (lastIndex < part.length) {
                parts.push(part.substring(lastIndex));
              }

              return (
                <div key={index} className="mb-1 last:mb-0">
                  {parts.map((text, i) => (
                    <span key={i}>
                      {text.match(/^(\[[^\]]+\]|(?:^|\s)([a-zA-Z]+\.)(?:\s|$))$/) ? (
                        <span className="font-semibold text-indigo-500">{text.trim()} </span>
                      ) : (
                        text.trim()
                      )}
                    </span>
                  ))}
                </div>
              );
            })}
      </div>
      {entry.exchange &&
        entry.exchange.split('/').some(item => {
          const [prefix] = item.split(':');
          return exchangeMap[prefix];
        }) && (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {entry.exchange.split('/').map((item, index) => {
              const [prefix, content] = item.split(':');
              if (prefix === '0' || prefix === '1' || !exchangeMap[prefix]) {
                return null;
              }
              return (
                <span
                  key={index}
                  className="scrollbar-hide h-[3.625rem] cursor-default overflow-auto rounded-md border border-gray-200 px-2 py-2 text-sm text-gray-700">
                  {`${exchangeMap[prefix]}: ${content}`}
                </span>
              );
            })}
          </div>
        )}
    </div>
  </div>
);

export default WordPanel;
