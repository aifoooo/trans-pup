import { IoReloadCircle } from 'react-icons/io5';

export interface InlineLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  position?: string;
}

export const InlineLoadingSpinner = ({
  size = 'md',
  color = 'text-blue-500',
  position = 'absolute bottom-1 right-1',
}: InlineLoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <div className={position}>
      <div className="flex items-center justify-center">
        <IoReloadCircle className={`${sizeClasses[size]} ${color} animate-spin`} />
      </div>
    </div>
  );
};
