import { useRef } from 'react';
import { SettingsPanel } from '../settings';

import './PressActions.css';

/**
 * Actions on the whole press: clearing it, changing its settings and exporting
 * it. The settings open in a dialog, which closes with its own button.
 */
const PressActions = ({ onClear, onExport }: { onClear: () => void; onExport: () => void }) => {
  const settingsDialogRef = useRef<HTMLDialogElement>(null);

  const handleSettingsClick = () => {
    settingsDialogRef.current?.showModal();
  };

  return (
    <>
      <div className="press-actions">
        <button type="button" className="clear" onClick={onClear}>
          Clear
        </button>
        <button type="button" onClick={handleSettingsClick}>
          Settings
        </button>
        <button type="button" className="export" onClick={onExport}>
          EXPORT
        </button>
      </div>
      <SettingsPanel ref={settingsDialogRef} />
    </>
  );
};

export default PressActions;
