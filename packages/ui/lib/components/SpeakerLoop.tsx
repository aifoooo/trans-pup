import { RxSpeakerModerate, RxSpeakerLoud } from 'react-icons/rx';

export const SpeakerLoop = ({ size = '3' }: { size?: string }) => {
  // 计算容器尺寸（根据传入的 size 动态生成，如 size=3 对应 12px）
  const containerSize = `${parseFloat(size) * 4}px`;

  return (
    <div
      className="relative inline-block"
      style={{
        height: containerSize,
        width: containerSize,
      }}>
      {/* 中等音量图标：绝对定位 + 填充父容器 + 动画 */}
      <RxSpeakerModerate className="animate-moderate absolute inset-0" />
      {/* 大声图标：绝对定位 + 填充父容器 + 初始透明 + 动画 */}
      <RxSpeakerLoud className="animate-loud absolute inset-0 opacity-0" />
    </div>
  );
};

export default SpeakerLoop;
