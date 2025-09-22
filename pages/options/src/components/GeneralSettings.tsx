const GeneralSettings = () => (
  <div>
    <h2 className="mb-4 text-left text-base">腾讯翻译</h2>
    <form className="mb-8 flex flex-col space-y-4 rounded-lg border border-gray-200 px-8 py-6 shadow-lg">
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="name">
          SecretId:
        </label>
        <span className="text-sm text-gray-400">（如何获取？）</span>
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700" htmlFor="email">
          SecretKey:
        </label>
        <span className="text-sm text-gray-400">（如何获取？）</span>
      </div>
    </form>
  </div>
);

export default GeneralSettings;
