import '@src/SidePanel.css';
import { useStorage, withErrorBoundary, withSuspense } from '@extension/shared';
import { exampleThemeStorage } from '@extension/storage';
import { cn, ErrorDisplay, LoadingSpinner } from '@extension/ui';
import { AiFillRead } from 'react-icons/ai';
import { FaRegStar } from 'react-icons/fa';
import { IoBagHandleOutline, IoSearch } from 'react-icons/io5';
import { MdOutlineNewLabel } from 'react-icons/md';

const SidePanel = () => {
  useStorage(exampleThemeStorage);

  return (
    <div className={cn('App', 'h-full overflow-y-auto bg-gray-100 px-5 py-6')}>
      {/* 状态卡片区域 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col rounded-lg border border-green-500 bg-white p-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500">
              <MdOutlineNewLabel className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">22222</span>
          </div>
          <span className="mt-1 text-sm font-medium text-gray-400">新单词</span>
        </div>
        <div className="flex flex-col rounded-lg bg-white p-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500">
              <AiFillRead className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">0</span>
          </div>
          <span className="mt-1 text-sm font-medium text-gray-400">学习中</span>
        </div>
        <div className="flex flex-col rounded-lg bg-white p-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500">
              <IoBagHandleOutline className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">0</span>
          </div>
          <span className="mt-1 text-sm font-medium text-gray-400">已掌握</span>
        </div>
        <div className="flex flex-col rounded-lg bg-white p-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-500">
              <FaRegStar className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold">0</span>
          </div>
          <span className="mt-1 text-sm font-medium text-gray-400">已收藏</span>
        </div>
      </div>

      {/* 单词列表区域 */}
      <div className="mt-6">
        <h2 className="mb-2 text-lg font-semibold">新单词</h2>
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <div className="p-3">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2">
                <IoSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="搜索单词"
                className="w-full rounded-lg bg-gray-100 py-1.5 pl-8 pr-2 text-sm hover:bg-gray-200 focus:bg-gray-100"
              />
            </div>
          </div>
          <ul className="divide-y divide-gray-200 border-t border-gray-200">
            {[
              {
                word: 'abandon',
                translation: '放弃；抛弃；遗弃；离弃；放弃（信念、信仰或看法）；中止；不再有；沉湎于（某种情感）',
              },
              { word: 'breadth', translation: '宽度；广度；范围' },
              { word: 'funnel', translation: '漏斗' },
              { word: 'invalidate', translation: '使无效；使作废；证明…… 错误' },
              { word: 'fictional', translation: '虚构的' },
              { word: 'fictional', translation: '虚构的' },
              { word: 'fictional', translation: '虚构的' },
              { word: 'fictional', translation: '虚构的' },
              { word: 'fictional', translation: '虚构的' },
              { word: 'fictional', translation: '虚构的' },
              { word: 'fictional', translation: '虚构的' },
              { word: 'fictional', translation: '虚构的' },
            ].map((item, index) => (
              <li
                key={index}
                className="flex items-center justify-between space-x-2 px-4 py-2 transition-colors hover:bg-gray-50">
                <span className="text-sm font-bold text-gray-700">{item.word}</span>
                <span className="truncate whitespace-nowrap text-sm text-gray-400">{item.translation}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default withErrorBoundary(withSuspense(SidePanel, <LoadingSpinner />), ErrorDisplay);
