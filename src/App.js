import '@fortawesome/fontawesome-free/js/all.min.js';
import Press from './Press';

import Workbench from './Workbench';
import { SettingsContextProvider } from './settings';

import './App.css';

const SHOW_WORKBENCH = process.env.REACT_APP_WORKBENCH === 'true';

function App() {
  return (
    <SettingsContextProvider>
      <div className="App">
        {SHOW_WORKBENCH ? <Workbench /> : <Press />}
      </div>
    </SettingsContextProvider>
  );
}

export default App;
