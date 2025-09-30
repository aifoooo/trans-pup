import App from '@src/matches/example/App';
import { createRoot } from 'react-dom/client';

const init = () => {
  const root = document.createElement('div');
  root.id = 'CEB-extension-example';
  root.style.display = 'none';
  document.body.append(root);

  createRoot(root).render(<App />);
};

init();
