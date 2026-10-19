import { useRef } from 'react';
import { SettingsPanel } from '../settings';
import type { PdfExportOptions } from '../../adapters/jspdf';
import ExportPanel from './ExportPanel';

import './PressActions.css';

/**
 * Actions on the whole press: clearing it, changing its settings and exporting
 * it. The settings and the export options open in popups.
 */
const PressActions = ({
  onClear,
  onExport,
}: {
  onClear: () => void;
  onExport: (options: PdfExportOptions) => void;
}) => {
  const settingsDialogRef = useRef<HTMLDialogElement>(null);
  const exportDialogRef = useRef<HTMLDialogElement>(null);

  const handleSettingsClick = () => {
    settingsDialogRef.current?.showModal();
  };

  const handleExportClick = () => {
    exportDialogRef.current?.showModal();
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
        <button type="button" className="export" onClick={handleExportClick}>
          EXPORT
        </button>
      </div>
      <SettingsPanel ref={settingsDialogRef} />
      <ExportPanel ref={exportDialogRef} onExport={onExport} />
    </>
  );
};

export default PressActions;
