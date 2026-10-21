import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        <div className="press-actions-bar">
          <div className="container">
            <button type="button" className="clear" onClick={onClear}>
              {t('press_actions.clear')}
            </button>
            <button type="button" onClick={handleSettingsClick}>
              {t('press_actions.settings')}
            </button>
            <button type="button" className="export big-button" onClick={handleExportClick}>
              {t('press_actions.export')}
            </button>
          </div>
        </div>
      </div>
      <SettingsPanel ref={settingsDialogRef} />
      <ExportPanel ref={exportDialogRef} onExport={onExport} />
    </>
  );
};

export default PressActions;
