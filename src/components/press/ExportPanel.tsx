import { useState, type ChangeEvent, type FormEvent, type MouseEvent, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PDF_EXPORT_OPTIONS, type PageSize, type PdfExportOptions } from '../../adapters/jspdf';
import { loadFromStorage, saveToStorage, type StorageKey } from '../../utils/storage';
import { isRecord } from '../../utils/object';
import { Popup } from '../popup';

import './ExportPanel.css';

/** Local storage key the last export options are saved in, as a JSON object */
const EXPORT_OPTIONS_STORAGE_KEY: StorageKey = 'press:EXPORT_OPTIONS@1';

/** Page sizes, with the keys of their labels in the texts of the app */
const PAGE_SIZE_OPTIONS: { value: PageSize; label: string }[] = [
  { value: 'a4', label: 'export_panel.page_sizes.a4' },
  { value: 'letter', label: 'export_panel.page_sizes.letter' },
];

/**
 * Popup asking how to export the press to a PDF, which remembers the last
 * options used.
 */
const ExportPanel = ({
  ref,
  onExport,
}: {
  ref?: Ref<HTMLDialogElement>;
  onExport: (options: PdfExportOptions) => void;
}) => {
  const { t } = useTranslation();
  const [options, setOptions] = useState(loadExportOptions);

  const handlePageSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOptions({ ...options, pageSize: event.target.value as PageSize });
  };

  const handleFileNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOptions({ ...options, fileName: event.target.value });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveToStorage('localStorage', EXPORT_OPTIONS_STORAGE_KEY, options);
    onExport(options);
    event.currentTarget.closest('dialog')?.close();
  };

  const handleCancelClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.closest('dialog')?.close();
  };

  return (
    <Popup ref={ref} className="export-panel">
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>{t('export_panel.page_size')}</legend>
          {PAGE_SIZE_OPTIONS.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name="pageSize"
                value={option.value}
                checked={options.pageSize === option.value}
                onChange={handlePageSizeChange}
              />
              {t(option.label)}
            </label>
          ))}
        </fieldset>
        <fieldset className="file-name">
          <legend>{t('export_panel.file_name')}</legend>
          <input
            type="text"
            aria-label={t('export_panel.file_name')}
            placeholder={DEFAULT_PDF_EXPORT_OPTIONS.fileName}
            value={options.fileName}
            onChange={handleFileNameChange}
          />
          <span>.pdf</span>
        </fieldset>
        <p className="print-hint">{t('export_panel.print_hint')}</p>
        <menu>
          <button type="button" onClick={handleCancelClick}>
            {t('export_panel.cancel')}
          </button>
          <button type="submit" className="export">
            {t('export_panel.export')}
          </button>
        </menu>
      </form>
    </Popup>
  );
};

/**
 * The last export options used, with the default of each one that isn't
 * saved or isn't valid.
 */
const loadExportOptions = (): PdfExportOptions => {
  const saved = loadFromStorage<Record<string, unknown>>('localStorage', EXPORT_OPTIONS_STORAGE_KEY, {}, isRecord);
  const pageSize = PAGE_SIZE_OPTIONS.find(({ value }) => value === saved.pageSize);
  return {
    pageSize: pageSize?.value ?? DEFAULT_PDF_EXPORT_OPTIONS.pageSize,
    fileName: typeof saved.fileName === 'string' ? saved.fileName : DEFAULT_PDF_EXPORT_OPTIONS.fileName,
  };
};

export default ExportPanel;
