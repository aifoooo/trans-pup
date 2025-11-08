import { SpeakerLoop } from '@/lib/components/SpeakerLoop';
import { WordActionMenu } from '@/lib/components/WordActionMenu';
import { useState, useRef } from 'react';
import { FaBookmark, FaRegBookmark } from 'react-icons/fa6';
import { RxSpeakerLoud } from 'react-icons/rx';
import type { WordEntry } from '@extension/dictionary';
import type { WordStatus } from '@extension/storage';
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

export const WordPanel: React.FC<{
  entry: WordEntry;
  showTags?: boolean;
  showExchanges?: boolean;
  currentStatus?: WordStatus | null; // 当前单词所在的列表状态
  onRemove?: () => void; // 删除单词的回调
  onStatusChange?: (newStatus: WordStatus) => void; // 改变单词状态的回调
}> = ({ entry, showTags = true, showExchanges = true, currentStatus = null, onRemove, onStatusChange }) => {
  const [playing, setPlaying] = useState<'en-GB' | 'en-US' | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const bookmarkRef = useRef<HTMLButtonElement>(null);

  const speakWord = (word: string, lang: 'en-GB' | 'en-US') => {
    if (playing) return; // 防止重复点击

    try {
      // 检查浏览器是否支持 speechSynthesis API
      if (!('speechSynthesis' in window)) {
        console.warn('[WordPanel] Speech synthesis not supported');
        return;
      }

      const synth = window.speechSynthesis;

      // 检查 speechSynthesis 是否可用
      if (!synth) {
        console.warn('[WordPanel] Speech synthesis not available');
        return;
      }

      setPlaying(lang);

      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = lang;
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // 播放结束时重置状态
      utterance.onend = () => {
        setPlaying(null);
      };

      // 捕获播放错误
      utterance.onerror = event => {
        console.error('[WordPanel] Speech synthesis error:', event.error);
        setPlaying(null);
      };

      // 播放音频的函数
      const playAudio = () => {
        try {
          const voices = synth.getVoices();
          // 尝试找到匹配语言的语音
          const englishVoice = voices.find(voice => voice.lang === lang);
          if (englishVoice) {
            utterance.voice = englishVoice;
          }
          synth.speak(utterance);
        } catch (error) {
          console.error('[WordPanel] Failed to play audio:', error);
          setPlaying(null);
        }
      };

      // 检查语音是否已经加载
      const voices = synth.getVoices();
      if (voices.length > 0) {
        // 语音已加载，直接播放
        playAudio();
      } else {
        // 语音未加载，等待加载完成
        const handleVoicesChanged = () => {
          playAudio();
          synth.onvoiceschanged = null; // 移除监听器，避免重复触发
        };
        synth.onvoiceschanged = handleVoicesChanged;

        // 设置超时，避免一直等待
        setTimeout(() => {
          if (synth.onvoiceschanged === handleVoicesChanged) {
            synth.onvoiceschanged = null;
            // 即使没有语音，也尝试播放（使用默认语音）
            playAudio();
          }
        }, 1000);
      }
    } catch (error) {
      // 捕获所有可能的异常，防止系统崩溃
      console.error('[WordPanel] Failed to play audio:', error);
      setPlaying(null);
    }
  };

  // 菜单操作处理函数
  const handleRemove = () => {
    setIsMenuOpen(false);
    onRemove?.();
  };

  const handleMoveToNew = () => {
    setIsMenuOpen(false);
    onStatusChange?.('new');
  };

  const handleMoveToLearning = () => {
    setIsMenuOpen(false);
    onStatusChange?.('learning');
  };

  const handleMoveToMastered = () => {
    setIsMenuOpen(false);
    onStatusChange?.('mastered');
  };

  // 根据单词状态获取书签图标颜色类名
  const getBookmarkColor = () => {
    switch (currentStatus) {
      case 'new':
        return 'text-green-500'; // 新单词 - 绿色
      case 'learning':
        return 'text-red-500'; // 学习中 - 红色
      case 'mastered':
        return 'text-yellow-500'; // 已掌握 - 黄色
      default:
        return 'text-gray-500'; // 不在列表中 - 白底灰边
    }
  };

  return (
    <div className="px-4 pb-5 pt-4">
      <div className="space-y-4">
        {showTags &&
          (entry.tag ||
            (entry.collins && Number(entry.collins) > 0) ||
            (entry.oxford && Number(entry.oxford) > 0) ||
            (entry.bnc && Number(entry.bnc) > 0) ||
            (entry.frq && Number(entry.frq) > 0)) && (
            <div className="scrollbar-hide flex cursor-default items-center gap-1 overflow-auto">
              {entry.tag &&
                entry.tag.split(' ').map((part, index) => (
                  <span
                    key={index}
                    className="whitespace-nowrap rounded-md bg-rose-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                    {tagMap[part] || part}
                  </span>
                ))}
              {entry.collins && Number(entry.collins) > 0 && (
                <span className="whitespace-nowrap rounded-md bg-violet-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                  柯林斯:{entry.collins}
                </span>
              )}
              {entry.oxford && Number(entry.oxford) > 0 && (
                <span className="whitespace-nowrap rounded-md bg-orange-500 px-1.5 py-0.5 text-xs font-semibold text-white">
                  牛津3000
                </span>
              )}
              {entry.bnc && Number(entry.bnc) > 0 && (
                <span className="whitespace-nowrap rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-500">
                  BNC:{entry.bnc}
                </span>
              )}
              {entry.frq && Number(entry.frq) > 0 && (
                <span className="whitespace-nowrap rounded-md bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-500">
                  FRQ:{entry.frq}
                </span>
              )}
            </div>
          )}
        <div className="flex flex-col gap-1">
          <div className="flex w-full items-center justify-between">
            <span className="text-lg font-bold">{entry.word}</span>
            <button
              ref={bookmarkRef}
              onMouseDown={e => e.stopPropagation()}
              onMouseUp={e => e.stopPropagation()}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onKeyDown={e => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setIsMenuOpen(!isMenuOpen);
                }
              }}
              className="flex cursor-pointer items-center"
              aria-label="单词操作菜单"
              aria-expanded={isMenuOpen}
              tabIndex={0}>
              {currentStatus === null ? (
                <FaRegBookmark className={`h-[0.875rem] w-[0.875rem] ${getBookmarkColor()}`} />
              ) : (
                <FaBookmark className={`h-[0.875rem] w-[0.875rem] ${getBookmarkColor()}`} />
              )}
            </button>
          </div>
          {entry.phonetic && (
            <div className="flex items-center gap-3">
              <div className="text-xs italic text-gray-500">[{entry.phonetic}]</div>
              {/* 英式发音 */}
              <div className="flex items-center gap-1 text-xs italic text-blue-500">
                <span className="cursor-default">BrE</span>
                <button
                  onClick={() => speakWord(entry.word, 'en-GB')}
                  onKeyDown={e => {
                    if (e.key === 'Enter') speakWord(entry.word, 'en-GB');
                  }}
                  className="flex cursor-pointer items-center"
                  tabIndex={0}>
                  {playing === 'en-GB' ? <SpeakerLoop /> : <RxSpeakerLoud title="英式发音" />}
                </button>
              </div>
              {/* 美式发音 */}
              <div className="flex items-center gap-1 text-xs italic text-red-500">
                <span className="cursor-default">AmE</span>
                <button
                  onClick={() => speakWord(entry.word, 'en-US')}
                  onKeyDown={e => {
                    if (e.key === 'Enter') speakWord(entry.word, 'en-US');
                  }}
                  className="flex cursor-pointer items-center"
                  tabIndex={0}>
                  {playing === 'en-US' ? <SpeakerLoop /> : <RxSpeakerLoud title="美式发音" />}
                </button>
              </div>
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
        {showExchanges &&
          entry.exchange &&
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

      {/* 单词操作菜单 */}
      <WordActionMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        currentStatus={currentStatus}
        onRemove={handleRemove}
        onMoveToNew={handleMoveToNew}
        onMoveToLearning={handleMoveToLearning}
        onMoveToMastered={handleMoveToMastered}
        anchorEl={bookmarkRef.current}
      />
    </div>
  );
};
