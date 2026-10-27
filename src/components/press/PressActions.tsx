import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsPanel } from '../settings';
import type { PdfExportOptions } from '../../adapters/jspdf';
import ExportPanel from './ExportPanel';
import { Popup } from '../popup';

import './PressActions.css';

/**
 * Actions on the whole press: clearing it (once confirmed), changing its
 * settings and exporting it. The settings and the export options open in
 * popups.
 *
 * @param props.canExport - Whether it can export, e.g. not while cards load or it's exporting
 * @param props.isExporting - Whether it's exporting, which the export button says
 */
const PressActions = ({
  canExport,
  isExporting,
  onClear,
  onExport,
}: {
  canExport: boolean;
  isExporting: boolean;
  onClear: () => void;
  onExport: (options: PdfExportOptions) => void;
}) => {
  const { t } = useTranslation();
  const clearDialogRef = useRef<HTMLDialogElement>(null);
  const settingsDialogRef = useRef<HTMLDialogElement>(null);
  const exportDialogRef = useRef<HTMLDialogElement>(null);

  const handleClearClick = () => {
    clearDialogRef.current?.showModal();
  };

  const handleClearCancelClick = () => {
    clearDialogRef.current?.close();
  };

  const handleClearConfirmClick = () => {
    onClear();
    clearDialogRef.current?.close();
  };

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
            <button type="button" className="danger" onClick={handleClearClick}>
              {t('press_actions.clear')}
            </button>
            <button type="button" onClick={handleSettingsClick}>
              {t('press_actions.settings')}
            </button>
            <button type="button" className="primary" disabled={!canExport} onClick={handleExportClick}>
              {t(isExporting ? 'press_actions.exporting' : 'press_actions.export')}
            </button>
          </div>
        </div>
      </div>
      <Popup ref={clearDialogRef} className="clear-panel">
        <p>{t('clear_panel.message')}</p>
        <menu>
          <button type="button" onClick={handleClearCancelClick}>
            {t('clear_panel.cancel')}
          </button>
          <button type="button" className="danger" onClick={handleClearConfirmClick}>
            {t('clear_panel.clear')}
          </button>
        </menu>
      </Popup>
      <SettingsPanel ref={settingsDialogRef} />
      <ExportPanel ref={exportDialogRef} onExport={onExport} />
    </>
  );
};

export default PressActions;
