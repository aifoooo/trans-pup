import { vocabularyStorage } from '@extension/storage';

const GeneralSettings = () => {
  const handleClearVocabulary = async () => {
    if (confirm('确定要清空单词本吗？此操作无法撤销。')) {
      try {
        await vocabularyStorage.clear();
      } catch (error) {
        console.error('清空单词本失败:', error);
        alert('清空单词本失败，请重试。');
      }
    }
  };

  return (
    <div>
      <h2 className="mb-4 text-left text-base">基本设置</h2>
      <form className="mb-8 flex flex-col space-y-4 rounded-lg border border-gray-200 px-8 py-4 shadow-md">
        <div className="flex items-center justify-between">
          <span className="text-base">单词本管理</span>
          <button
            type="button"
            onClick={handleClearVocabulary}
            className="rounded-full bg-blue-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-600">
            一键清空
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeneralSettings;
