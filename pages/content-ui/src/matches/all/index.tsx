import App from '@src/matches/all/App';
import { createRoot } from 'react-dom/client';

const init = () => {
  const root = document.createElement('div');
  root.id = 'CEB-extension-all';
  root.style.display = 'none';
  document.body.append(root);

  createRoot(root).render(<App />);
};

init();
