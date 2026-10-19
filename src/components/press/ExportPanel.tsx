import { useState, type ChangeEvent, type FormEvent, type MouseEvent, type Ref } from 'react';
import { DEFAULT_PDF_EXPORT_OPTIONS, type PageSize, type PdfExportOptions } from '../../adapters/jspdf';
import { loadFromStorage, saveToStorage } from '../../utils/storage';
import { isRecord } from '../../utils/object';
import { Popup } from '../popup';

import './ExportPanel.css';

/** Local storage key the last export options are saved in, as a JSON object */
const EXPORT_OPTIONS_STORAGE_KEY = 'press:exportOptions';

const PAGE_SIZE_OPTIONS: { value: PageSize; label: string }[] = [
  { value: 'a4', label: 'A4' },
  { value: 'letter', label: 'Letter' },
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
  const [options, setOptions] = useState(loadExportOptions);

  const handlePageSizeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOptions({ ...options, pageSize: event.target.value as PageSize });
  };

  const handleFileNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setOptions({ ...options, fileName: event.target.value });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveToStorage(localStorage, EXPORT_OPTIONS_STORAGE_KEY, options);
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
          <legend>Page size</legend>
          {PAGE_SIZE_OPTIONS.map((option) => (
            <label key={option.value}>
              <input
                type="radio"
                name="pageSize"
                value={option.value}
                checked={options.pageSize === option.value}
                onChange={handlePageSizeChange}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
        <fieldset className="file-name">
          <legend>File name</legend>
          <input
            type="text"
            aria-label="File name"
            placeholder={DEFAULT_PDF_EXPORT_OPTIONS.fileName}
            value={options.fileName}
            onChange={handleFileNameChange}
          />
          <span>.pdf</span>
        </fieldset>
        <menu>
          <button type="button" onClick={handleCancelClick}>
            Cancel
          </button>
          <button type="submit" className="export">
            Export
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
  const saved = loadFromStorage<Record<string, unknown>>(localStorage, EXPORT_OPTIONS_STORAGE_KEY, {}, isRecord);
  const pageSize = PAGE_SIZE_OPTIONS.find(({ value }) => value === saved.pageSize);
  return {
    pageSize: pageSize?.value ?? DEFAULT_PDF_EXPORT_OPTIONS.pageSize,
    fileName: typeof saved.fileName === 'string' ? saved.fileName : DEFAULT_PDF_EXPORT_OPTIONS.fileName,
  };
};

export default ExportPanel;
