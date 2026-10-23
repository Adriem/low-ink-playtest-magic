import '@fortawesome/fontawesome-free/js/all.min.js';
import { lazy, Suspense } from 'react';
import Press from './components/press/Press';
import SiteFooter from './components/footer/SiteFooter';
import TermsDialog from './components/terms/TermsDialog';

import { SettingsContextProvider } from './components/settings';

const WORKBENCH_PATH = '/workbench';

// The workbench is a development-only page. In production builds
// import.meta.env.DEV is replaced with false, so this branch (and the
// workbench chunk) is dropped.
const Workbench = import.meta.env.DEV ? lazy(() => import('./components/workbench/Workbench')) : null;

function App() {
  return (
    <SettingsContextProvider>
      <div className="App">
        {Workbench != null && isWorkbenchPath() ? (
          <Suspense fallback={<div>LOADING...</div>}>
            <Workbench />
          </Suspense>
        ) : (
          <>
            <Press />
            <SiteFooter />
            <TermsDialog />
          </>
        )}
      </div>
    </SettingsContextProvider>
  );
}

const isWorkbenchPath = () => {
  return window.location.pathname.replace(/\/+$/, '') === WORKBENCH_PATH;
};

export default App;
