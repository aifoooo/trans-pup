import type React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  colorClass: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, colorClass, icon }) => (
  <div className="flex flex-col items-center space-y-2 rounded-lg border border-gray-200 bg-white p-2.5">
    <span className="text-xl font-bold">{value}</span>
    <div className="flex items-center">
      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${colorClass}`}>{icon}</div>
      <span className="ml-1 text-sm font-medium text-gray-400">{title}</span>
    </div>
  </div>
);

export default StatCard;
