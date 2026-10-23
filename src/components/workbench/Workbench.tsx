import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Card from '../cards/Card';
import DualCard from '../cards/DualCard';
import type { ArtFidelity, CardStyle, InkLevel } from '../cards/styles';
import { getSubCardPosition, type CardFace } from '../../domain/cards';
import { isColorSymbol, type ColorSymbol } from '../../domain/colors';
import useCardData from './useCardData';
import Reference from './Reference';
import { SETTINGS_DEFINITIONS, isSettingAvailable, useCardPalette, useSetting } from '../settings';

import './Workbench.css';

const COLOR_OPTIONS = [
  { value: '', label: 'default' },
  { value: 'none', label: 'none' },
  { value: 'W', label: 'white' },
  { value: 'U', label: 'blue' },
  { value: 'B', label: 'black' },
  { value: 'R', label: 'red' },
  { value: 'G', label: 'green' },
  { value: 'W,U,B,R,G', label: 'gold' },
  { value: 'R,G', label: 'gruul' },
  { value: 'U,R', label: 'izzet' },
  { value: 'W,B', label: 'orzhov' },
  { value: 'G,U', label: 'simic' },
  { value: 'G,B', label: 'golgari' },
  { value: 'W,U', label: 'azorius' },
  { value: 'W,G', label: 'selesnya' },
  { value: 'B,R', label: 'rakdos' },
  { value: 'B,U', label: 'dimir' },
  { value: 'W,R', label: 'boros' },
];

const Workbench = () => {
  const { t } = useTranslation();
  const [opacity, setOpacity] = useState(0);
  const [cardColors, setCardColors] = useState<ColorSymbol[] | null>(null);
  const [cardName, setCardName] = useState('Colossal Dreadmaw');
  const [cardVariant, setCardVariant] = useSetting('cardVariant');
  const [inkLevel, setInkLevel] = useSetting('inkLevel');
  const customPalette = useCardPalette(cardVariant);
  const [artFidelity, setArtFidelity] = useSetting('artFidelity');
  const [cardBorder] = useSetting('cardBorder');
  const [cardCorners] = useSetting('cardCorners');

  const { card, referenceImageUrl, loading, error } = useCardData(cardName);
  // The colors picked override the face's, and the other half's of split cards, to try the color treatments
  const face = useMemo(() => card && withColors(card.mainFace, cardColors), [card, cardColors]);
  const splitHalf = useMemo(
    () => card?.layout === 'split' && card.secondaryFace && withColors(card.secondaryFace, cardColors),
    [card, cardColors],
  );

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    const input = e.currentTarget.elements.namedItem('cardName') as HTMLInputElement;
    setCardName(input.value);
  };
  const handleStyleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    return setCardVariant(e.target.value as CardStyle);
  };
  const handleInkLevelChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setInkLevel(e.target.value as InkLevel);
  };
  const handleArtFidelityChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setArtFidelity(e.target.value as ArtFidelity);
  };
  const handleColorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setCardColors(value === '' ? null : value === 'none' ? [] : value.split(',').filter(isColorSymbol));
  };
  const handleReferenceChange = (e: ChangeEvent<HTMLInputElement>) => {
    return setOpacity(parseFloat(e.target.value));
  };

  return (
    <>
      <div className="workbench">
        {!card || !face ? (
          <div>NO CARD DATA</div>
        ) : loading ? (
          <div>LOADING...</div>
        ) : error ? (
          <div>
            ERROR ({error.name}): {error.message}
          </div>
        ) : (
          <div className="workbench-card">
            <div className="workbench-reference" style={{ opacity }}>
              <Reference imageUrl={referenceImageUrl} />
            </div>

            {/* Split cards have both halves on their front, so they're drawn together, as in the press */}
            {splitHalf ? (
              <DualCard
                cardStyle={cardVariant}
                faces={[face, splitHalf]}
                inkLevel={inkLevel}
                customPalette={customPalette}
                defaultArtFidelity={artFidelity}
                blackBordered={cardBorder === 'full'}
                outlined={cardBorder === 'outline'}
                roundedCorners={cardCorners === 'rounded'}
              />
            ) : (
              <Card
                cardStyle={cardVariant}
                face={face}
                subFace={getSubCardPosition(card) ? card.secondaryFace : undefined}
                subFacePosition={getSubCardPosition(card)}
                blackBordered={cardBorder === 'full'}
                outlined={cardBorder === 'outline'}
                roundedCorners={cardCorners === 'rounded'}
                inkLevel={inkLevel}
                customPalette={customPalette}
                defaultArtFidelity={artFidelity}
              />
            )}
          </div>
        )}
      </div>

      <div className="workbench-controls">
        <form action="#" className="workbench-search" onSubmit={handleSearchSubmit}>
          <input id="cardName" type="text" aria-label="Card name" placeholder="Card name" />
          <input type="submit" value="Search" />
        </form>

        <div className="workbench-settings">
          <div className="workbench-field">
            <label htmlFor="cardVariant">Style</label>
            <select id="cardVariant" value={cardVariant} onChange={handleStyleChange}>
              {SETTINGS_DEFINITIONS.cardVariant.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.label)}
                </option>
              ))}
            </select>
          </div>
          <div className="workbench-field">
            <label htmlFor="cardColors">Color</label>
            <select id="cardColors" defaultValue="" onChange={handleColorChange}>
              {COLOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.label)}
                </option>
              ))}
            </select>
          </div>
          <div className="workbench-field">
            <label htmlFor="inkLevel">Ink</label>
            <select id="inkLevel" value={inkLevel} onChange={handleInkLevelChange}>
              {SETTINGS_DEFINITIONS.inkLevel.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.label)}
                </option>
              ))}
            </select>
          </div>
          <div className="workbench-field">
            <label htmlFor="artFidelity">Art</label>
            <select
              id="artFidelity"
              value={artFidelity}
              disabled={!isSettingAvailable('artFidelity', cardVariant)}
              onChange={handleArtFidelityChange}
            >
              {SETTINGS_DEFINITIONS.artFidelity.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {t(option.label)}
                </option>
              ))}
            </select>
          </div>
          <div className="workbench-field workbench-reference-slider">
            <label htmlFor="referenceOpacity">Reference</label>
            <input
              id="referenceOpacity"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={opacity}
              onChange={handleReferenceChange}
            />
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * A face with the colors picked instead of its own, if any.
 */
const withColors = (face: CardFace, colors: ColorSymbol[] | null): CardFace => {
  return colors ? { ...face, colors } : face;
};

export default Workbench;
