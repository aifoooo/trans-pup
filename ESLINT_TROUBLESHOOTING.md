# 检查 ESLint 配置是否被正确识别

## 步骤 1: 检查 ESLint 输出日志
1. 在 Cursor/VS Code 中按 `Cmd + Shift + P`（Mac）或 `Ctrl + Shift + P`（Windows/Linux）
2. 输入并选择：`ESLint: Show Output Channel`
3. 查看输出，应该看到类似以下内容：
   ```
   ESLint server is running.
   ESLint library loaded from: /path/to/node_modules/eslint/lib/api.js
   ```

## 步骤 2: 验证配置文件位置
项目使用 Flat Config 格式，配置文件位于：
- `eslint.config.ts`（根目录）

## 步骤 3: 检查文件类型识别
在 `SidePanel.tsx` 文件中：
1. 打开文件
2. 查看状态栏（底部），应该显示文件类型为 "TypeScript React"
3. 如果显示为 "Plain Text" 或其他，说明文件类型识别有问题

## 步骤 4: 手动验证配置
运行以下命令验证 ESLint 配置：
```bash
# 在项目根目录运行
npx eslint pages/side-panel/src/SidePanel.tsx --print-config | head -20
```

## 步骤 5: 重启 ESLint 服务器
如果配置已更新但 IDE 仍显示错误：
1. 按 `Cmd + Shift + P`（Mac）或 `Ctrl + Shift + P`（Windows/Linux）
2. 输入：`ESLint: Restart ESLint Server`
3. 等待几秒钟让服务器重新加载

## 步骤 6: 检查扩展版本
确保安装了最新版本的 ESLint 扩展：
- 打开扩展面板（`Cmd + Shift + X`）
- 搜索 "ESLint"
- 确认已安装且是最新版本

## 常见问题排查

### 问题 1: ESLint 扩展未启用
- 检查 `.vscode/settings.json` 中 `eslint.enable` 是否为 `true`
- 检查扩展是否已安装并启用

### 问题 2: Flat Config 未识别
- 确认 `.vscode/settings.json` 中 `eslint.useFlatConfig` 为 `true`
- 确认项目根目录存在 `eslint.config.ts` 文件

### 问题 3: TypeScript 文件类型未识别
- 检查文件扩展名是否为 `.tsx` 或 `.ts`
- 检查是否安装了 TypeScript 扩展
- 运行 `ESLint: Restart ESLint Server` 重启服务器

### 问题 4: 工作区配置未生效
- 确认 `.vscode/settings.json` 文件存在
- 重启 Cursor/VS Code
- 检查是否有用户级别的设置覆盖了工作区设置

