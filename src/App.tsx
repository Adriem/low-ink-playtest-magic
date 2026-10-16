import '@fortawesome/fontawesome-free/js/all.min.js';
import { lazy, Suspense } from 'react';
import Press from './components/press/Press';

import { SettingsContextProvider } from './components/settings';

const WORKBENCH_PATH = '/workbench';

// The workbench is a development-only page. In production builds
// import.meta.env.DEV is replaced with false, so this branch (and the
// workbench chunk) is dropped.
const Workbench = import.meta.env.DEV ? lazy(() => import('./components/workbench/Workbench')) : null;

const isWorkbenchPath = () => window.location.pathname.replace(/\/+$/, '') === WORKBENCH_PATH;

function App() {
  return (
    <SettingsContextProvider>
      <div className="App">
        {Workbench != null && isWorkbenchPath() ? (
          <Suspense fallback={<div>LOADING...</div>}>
            <Workbench />
          </Suspense>
        ) : (
          <Press />
        )}
      </div>
    </SettingsContextProvider>
  );
}

export default App;
