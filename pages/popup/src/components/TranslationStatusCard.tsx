import type React from 'react';

interface TranslationStatusCardProps {
  type: 'error' | 'success';
  title: string;
  message: string;
}

const TranslationStatusCard: React.FC<TranslationStatusCardProps> = ({ type, title, message }) => {
  const bgColor = 'border-t border-gray-200';
  const textColor = type === 'error' ? 'text-red-500' : '';

  return (
    <div className={`flex flex-col ${bgColor} text-sm`}>
      <div className="flex flex-row items-center p-2 font-medium">
        <img
          src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAACNklEQVR4AezTA+wcQRTH8fkbQW0jrq2gCGvbtts4qWK7NqLatm3b5vnu9ZtkLpnsaXdrTPI57pvfWzwlIr/U/wZ+eQPO1jjJw2Csw1OEEMZzbMBg5KvvuMzwPngGSeElBn7P4CwsgsThgwcSx0Jkfo8GFkMMdzAKZY1jymI07kIMi741vCfEMB+5SY7PjdNwH7fh2XgK0ebZrEuzNPEcOW4fOtEeIs/htNzDdexHUzcNrIZoU1zUpylX6/jtGpilVr04gctq0euzauujOfxW2vYey6U0pmE9DmAjZqFGsuBCWANJIICZyEwSnIWZCEASWINC1vBSuAGxYS+KxAnPx3aIDTdQKhqehkMQLYIVaINa6IGDEMMtVDHCi+EkxHAQ3VALbbAcEYh2CGmKjTpAtBDaK2MZTU5GGKKdM8IvQQzTkRbnKrVHCKJ1UGy0EaLNTvGAtocHj1GVDcriFkQLY0CKB3Q2RNuo2OgNRCtvY0rq6vBKuA3RAuhqY0LKQ7Q3ygj3OxizqnhsCW/noN4P6kDwJ4hW0EZxdTyBaB60chBeEKJ9UpYJGGEj/JW5AVooJ2u5jFDmJBA6BqK9RtUEhQ3xHqJ9QEOH4VXxGqKNUQTm4j5Ee4XRKGEUNsMHiPYKDRwEl8Boy9W7j9zok90YHoiFRx25d0mtDHssc+7He5s8EAsPGlvHqx7uQaIIv6lWhbxG4fdwD3UTzXguhmMX4efMM/9Gr7ATI/F1yI2Tge8XjDpg1AEAsMEBDrhlyj8AAAAASUVORK5CYII="
          alt="腾讯云"
          className="mr-1 h-5 w-5 rounded-full border border-gray-300 p-0.5"
        />
        <span>{title}</span>
      </div>
      <div className="px-5 pb-5">
        <span className={textColor}>{message}</span>
      </div>
    </div>
  );
};

export default TranslationStatusCard;
