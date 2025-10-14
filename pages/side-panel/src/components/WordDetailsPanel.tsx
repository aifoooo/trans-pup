import type { WordEntry } from '@extension/dictionary';
import type React from 'react';

const WordDetailsPanel: React.FC<{ entry: WordEntry }> = ({ entry }) => (
  <div className="border-t border-gray-200 bg-gray-50 p-4">
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">音标:</span>
        <span className="text-sm text-gray-500">{entry.phonetic || 'N/A'}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">标签:</span>
        <span className="text-sm text-gray-500">{entry.tag || 'N/A'}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">翻译:</span>
        <span className="text-sm text-gray-500">{entry.translation || 'N/A'}</span>
      </div>
    </div>
  </div>
);

export default WordDetailsPanel;
