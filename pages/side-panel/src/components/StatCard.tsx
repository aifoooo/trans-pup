import type React from 'react';

interface StatCardProps {
  title: string;
  value: number;
  colorClass: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, colorClass, icon }) => (
  <div className="flex flex-col rounded-lg bg-white p-2.5 shadow-sm">
    <div className="flex items-center justify-between">
      <div className={`flex h-6 w-6 items-center justify-center rounded-full ${colorClass}`}>{icon}</div>
      <span className="text-xl font-bold">{value}</span>
    </div>
    <span className="mt-1 text-sm font-medium text-gray-400">{title}</span>
  </div>
);

export default StatCard;
