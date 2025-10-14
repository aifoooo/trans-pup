import type { WordEntry } from '@extension/dictionary';
import type React from 'react';

const WordDetailsPanel: React.FC<{ entry: WordEntry }> = ({ entry }) => (
  <div className="border-t border-gray-200 p-4">
    <div className="space-y-2">
      {entry.tag && (
        <div className="flex items-center space-x-1">
          {entry.tag.split(' ').map((part, index) => (
            <span key={index} className="rounded-md border border-red-500 px-1 text-xs text-red-500">
              {part}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center space-x-1">
        <span className="text-sm font-bold">{entry.word}</span>
        <span className="text-sm text-gray-500">{entry.phonetic ? `[${entry.phonetic}]` : ''}</span>
      </div>
      <div className="flex items-center">
        <pre className="whitespace-pre-wrap text-sm text-gray-500">{entry.translation || ''}</pre>
      </div>
    </div>
  </div>
);

export default WordDetailsPanel;
