import { RingLoader } from 'react-spinners';

interface ILoadingSpinnerProps {
  size?: number;
}

export const LoadingSpinner = ({ size }: ILoadingSpinnerProps) => (
  <div className={'flex h-full w-full items-center justify-center'}>
    <RingLoader size={size ?? 100} color={'aqua'} />
  </div>
);
