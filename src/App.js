import '@fortawesome/fontawesome-free/js/all.min.js';
import { lazy, Suspense } from 'react';
import Press from './Press';

import { SettingsContextProvider } from './settings';

const WORKBENCH_PATH = '/workbench';

// The workbench is a development-only page. In production builds NODE_ENV is
// replaced with a constant, so this branch (and the workbench chunk) is dropped.
const Workbench = process.env.NODE_ENV === 'development'
  ? lazy(() => import('./workbench/Workbench'))
  : null;

const isWorkbenchPage = () => (
  Workbench != null && window.location.pathname.replace(/\/+$/, '') === WORKBENCH_PATH
);

function App() {
  return (
    <SettingsContextProvider>
      <div className="App">
        {isWorkbenchPage() ? (
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
