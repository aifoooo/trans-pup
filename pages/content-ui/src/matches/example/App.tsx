import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    console.log('[CEB] Content ui example loaded');
  }, []);

  return <div></div>;
}
