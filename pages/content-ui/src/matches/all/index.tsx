import '@src/matches/all/index.css';
import { initAppWithShadow } from '@extension/shared';
import App from '@src/matches/all/App';
import cssText from '@src/matches/all/index.css?inline';

const init = () => {
  initAppWithShadow({
    id: 'CEB-extension-all',
    app: <App />,
    inlineCss: cssText,
  });
};

init();
