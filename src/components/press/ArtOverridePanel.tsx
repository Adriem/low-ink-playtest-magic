import { useEffect, useEffectEvent, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import {
  clearArtOverrides,
  getSubCardPosition,
  overrideArt,
  UNKNOWN_ARTIST,
  type ArtFidelity,
  type ArtOverrideImages,
  type Card,
} from '../../domain/cards';
import { loadImage } from '../cards/common/canvasRendering';
import { Popup } from '../popup';
import { SETTINGS_DEFINITIONS } from '../settings';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';

import './ArtOverridePanel.css';

const FIDELITY_OPTIONS = SETTINGS_DEFINITIONS.artFidelity.options;
/** How long typing has to pause before the card previews the URLs, rather than loading every partial one */
const URL_PREVIEW_DELAY_MS = 500;

/** One image for both faces of a card, or one per face */
type ImagesMode = ArtOverrideImages['kind'];

/**
 * Popup to draw a card with art of the user's own: images from URLs, how
 * faithfully they're drawn, and who made them. Cards with two arts (e.g. split
 * or double-faced cards) take one image with both, or one per face. The card
 * shows the changes as they're made, and they're saved, or discarded when it
 * closes. It opens when it's rendered.
 *
 * @param props.onPreview - Called with the card as edited, on every change
 * @param props.onSave - Called with the card, with its art overridden, or cleared
 * @param props.onClose - Called once it closes, saved or not
 */
const ArtOverridePanel = ({
  card,
  onPreview,
  onSave,
  onClose,
}: {
  card: Card;
  onPreview: (card: Card) => void;
  onSave: (card: Card) => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDialogElement>(null);
  const faces = hasTwoArts(card) && card.secondaryFace ? [card.mainFace, card.secondaryFace] : [card.mainFace];
  const [mode, setMode] = useState(() => getInitialMode(card));
  const [unifiedUrl, setUnifiedUrl] = useState(() =>
    getInitialMode(card) === 'unified' ? getOverrideUrl(card, 0) : '',
  );
  const [faceUrls, setFaceUrls] = useState(() => faces.map((_face, index) => getOverrideUrl(card, index)));
  const [fidelity, setFidelity] = useState<ArtFidelity>(
    card.mainFace.artOverride?.fidelity ??
      card.secondaryFace?.artOverride?.fidelity ??
      SETTINGS_DEFINITIONS.artFidelity.default,
  );
  // Unknown artists show as the field's placeholder
  const [artist, setArtist] = useState(() => getOverrideArtist(card));
  const [hasLoadError, setHasLoadError] = useState(false);
  const fidelityIndex = FIDELITY_OPTIONS.findIndex((option) => option.value === fidelity);
  const editedCard = editCard(card, { mode, unifiedUrl, faceUrls, fidelity, artist });
  const urls = getUrls(mode, unifiedUrl, faceUrls);
  // The card previews the URLs once typing pauses, and the rest of the changes right away
  const previewedUnifiedUrl = useDebouncedValue(unifiedUrl, URL_PREVIEW_DELAY_MS);
  const previewedFaceUrls = useDebouncedValue(faceUrls, URL_PREVIEW_DELAY_MS);
  const previewedCard = editCard(card, {
    mode,
    unifiedUrl: previewedUnifiedUrl,
    faceUrls: previewedFaceUrls,
    fidelity,
    artist,
  });

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const previewCard = useEffectEvent(() => onPreview(previewedCard));
  useEffect(() => {
    previewCard();
  }, [mode, previewedUnifiedUrl, previewedFaceUrls, fidelity, artist]);

  const close = () => {
    ref.current?.close();
  };

  const handleModeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMode(event.target.value as ImagesMode);
    setHasLoadError(false);
  };

  const handleUnifiedUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setUnifiedUrl(event.target.value);
    setHasLoadError(false);
  };

  const handleFaceUrlChange = (faceIndex: number, url: string) => {
    setFaceUrls((urls) => urls.map((faceUrl, index) => (index === faceIndex ? url : faceUrl)));
    setHasLoadError(false);
  };

  const handleFidelityChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFidelity(FIDELITY_OPTIONS[Number(event.target.value)].value);
  };

  const handleArtistChange = (event: ChangeEvent<HTMLInputElement>) => {
    setArtist(event.target.value);
  };

  const handleClearClick = () => {
    onSave(clearArtOverrides(card));
    close();
  };

  const handleCancelClick = () => {
    close();
  };

  // The images are loaded as the cards load them, so images that can't be drawn on them aren't saved
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void Promise.all(urls.map(loadImage)).then(
      () => {
        onSave(editedCard);
        close();
      },
      () => setHasLoadError(true),
    );
  };

  return (
    <Popup ref={ref} className="art-override-panel" onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>{t('art_override.title')}</legend>
          {faces.length > 1 && (
            <div className="art-override-modes" role="radiogroup" aria-label={t('art_override.mode')}>
              {(['unified', 'split'] as const).map((value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="imagesMode"
                    value={value}
                    checked={mode === value}
                    onChange={handleModeChange}
                  />
                  {t(`art_override.${value}`)}
                </label>
              ))}
            </div>
          )}
          {mode === 'unified' ? (
            <label className="art-override-url">
              {t('art_override.url')}
              <input type="url" value={unifiedUrl} placeholder="https://" onChange={handleUnifiedUrlChange} />
            </label>
          ) : (
            faces.map((face, index) => (
              <label key={face.name} className="art-override-url">
                {t('art_override.face_url', { face: face.name })}
                <input
                  type="url"
                  value={faceUrls[index]}
                  placeholder="https://"
                  onChange={(event) => handleFaceUrlChange(index, event.target.value)}
                />
              </label>
            ))
          )}
          <label className="art-override-url">
            {t('art_override.artist')}
            <input
              type="text"
              value={artist}
              placeholder={t('art_override.artist_placeholder')}
              onChange={handleArtistChange}
            />
          </label>
          {faces.length > 1 && (
            <p className="art-override-hint">
              {t(mode === 'unified' ? 'art_override.unified_hint' : 'art_override.split_hint')}
            </p>
          )}
          {hasLoadError && (
            <p className="art-override-error" role="alert">
              {t('art_override.load_error')}
            </p>
          )}
        </fieldset>
        {/* Without images, there's nothing to draw with the fidelity */}
        <fieldset disabled={urls.length === 0}>
          <legend>{t('art_override.fidelity')}</legend>
          <input
            type="range"
            min={0}
            max={FIDELITY_OPTIONS.length - 1}
            step={1}
            value={fidelityIndex}
            aria-label={t('art_override.fidelity')}
            aria-valuetext={t(FIDELITY_OPTIONS[fidelityIndex].label)}
            onChange={handleFidelityChange}
          />
        </fieldset>
        <menu>
          <button type="button" className="art-override-clear" onClick={handleClearClick}>
            {t('art_override.clear')}
          </button>
          <button type="button" onClick={handleCancelClick}>
            {t('art_override.cancel')}
          </button>
          <button type="submit">{t('art_override.save')}</button>
        </menu>
      </form>
    </Popup>
  );
};

/**
 * The card as edited: with its art overridden by the images of its URLs, or
 * its own art without them.
 */
const editCard = (
  card: Card,
  {
    mode,
    unifiedUrl,
    faceUrls,
    fidelity,
    artist,
  }: { mode: ImagesMode; unifiedUrl: string; faceUrls: string[]; fidelity: ArtFidelity; artist: string },
): Card => {
  const images: ArtOverrideImages =
    mode === 'unified'
      ? { kind: 'unified', url: unifiedUrl.trim() }
      : { kind: 'split', urls: faceUrls.map((url) => url.trim()) };
  return getUrls(mode, unifiedUrl, faceUrls).length > 0
    ? overrideArt(card, images, fidelity, artist)
    : clearArtOverrides(card);
};

/**
 * The URLs of the images, without the empty ones.
 */
const getUrls = (mode: ImagesMode, unifiedUrl: string, faceUrls: string[]): string[] => {
  return (mode === 'unified' ? [unifiedUrl] : faceUrls).map((url) => url.trim()).filter(Boolean);
};

/**
 * Whether both faces of a card are drawn with art, e.g. split and
 * double-faced cards, unlike the sub-cards of adventures.
 */
const hasTwoArts = (card: Card): boolean => {
  return card.secondaryFace != null && !getSubCardPosition(card);
};

/**
 * How the card's art is overridden: as it was saved, else with one image for
 * cards whose faces share theirs (e.g. split cards), and one per face for the
 * others (e.g. double-faced cards).
 */
const getInitialMode = (card: Card): ImagesMode => {
  if (!hasTwoArts(card)) return 'unified';

  const mainUrl = card.mainFace.artOverride?.url;
  const secondaryUrl = card.secondaryFace?.artOverride?.url;
  if (mainUrl || secondaryUrl) return mainUrl === secondaryUrl ? 'unified' : 'split';
  return card.layout === 'double-faced' ? 'split' : 'unified';
};

/**
 * URL of the image overriding the art of a face of a card, or nothing.
 */
const getOverrideUrl = (card: Card, faceIndex: number): string => {
  const face = faceIndex === 0 ? card.mainFace : card.secondaryFace;
  return face?.artOverride?.url ?? '';
};

/**
 * Artist of the images overriding the art of a card, or nothing when they
 * have none, or an unknown one.
 */
const getOverrideArtist = (card: Card): string => {
  const artist = card.mainFace.artOverride?.artist ?? card.secondaryFace?.artOverride?.artist;
  return artist && artist !== UNKNOWN_ARTIST ? artist : '';
};

export default ArtOverridePanel;
