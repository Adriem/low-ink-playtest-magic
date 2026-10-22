import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useFlag } from '../../hooks/useFlag';
import { loadFromStorage, saveToStorage, type StorageKey } from '../../utils/storage';
import { Popup } from '../popup';

import './TermsDialog.css';

/**
 * Local storage key of whether the user agreed to the terms. Bumping its
 * version when they change asks everyone to agree to them again.
 */
const TERMS_STORAGE_KEY: StorageKey = 'press:TERMS_ACCEPTED@1';

/**
 * Terms of use, which users agree to before using the app (where the
 * `TERMS_DIALOG` flag is on), until they agree to them.
 */
const TermsDialog = () => {
  const isEnabled = useFlag('TERMS_DIALOG');
  const [hasAgreed, setHasAgreed] = useState(loadHasAgreed);

  const handleAgree = () => {
    saveToStorage('localStorage', TERMS_STORAGE_KEY, true);
    setHasAgreed(true);
  };

  if (!isEnabled || hasAgreed) return null;

  return <TermsModal onAgree={handleAgree} />;
};

const loadHasAgreed = (): boolean => {
  return loadFromStorage<boolean>('localStorage', TERMS_STORAGE_KEY, false) === true;
};

/** The terms, in a popup that only closes by agreeing to them */
const TermsModal = ({ onAgree }: { onAgree: () => void }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const handleCheckChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onAgree();
  };

  return (
    <Popup ref={ref} className="terms-dialog" dismissible={false} aria-labelledby="terms-title">
      <form onSubmit={handleSubmit}>
        <h2 id="terms-title">{t('terms.title')}</h2>
        <p>{t('terms.personal_use')}</p>
        <p>{t('terms.agreement')}</p>
        <label>
          <input type="checkbox" checked={isChecked} onChange={handleCheckChange} />
          {t('terms.agree')}
        </label>
        <menu>
          <button type="submit" disabled={!isChecked}>
            {t('terms.continue')}
          </button>
        </menu>
      </form>
    </Popup>
  );
};

export default TermsDialog;
