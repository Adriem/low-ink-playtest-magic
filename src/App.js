import '@fortawesome/fontawesome-free/js/all.min.js';
import Press from './Press';

import Workbench from './Workbench';
import { SettingsContextProvider } from './settings';

import './App.css';

function App() {
  return (
    <SettingsContextProvider>
      <div className="App">
        {/*<Workbench />*/}
        <Press />
      </div>
    </SettingsContextProvider>
  );
}

export default App;
