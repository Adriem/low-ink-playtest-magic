import { useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import Card from '../cards/Card';
import type { CardStyle } from '../cards/styles';
import { getSubCardPosition } from '../../domain/cards';
import { isColorSymbol, type ColorSymbol } from '../../domain/colors';
import useCardData from './useCardData';
import Reference from './Reference';
import { SETTINGS_DEFINITIONS, useSetting } from '../settings';

import './Workbench.css';

const COLOR_OPTIONS = [
  { value: '', label: 'default' },
  { value: 'none', label: 'none' },
  { value: 'W', label: 'white' },
  { value: 'U', label: 'blue' },
  { value: 'B', label: 'black' },
  { value: 'R', label: 'red' },
  { value: 'G', label: 'green' },
  { value: 'W,U,B,R,G', label: 'multi' },
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
  const [opacity, setOpacity] = useState(0);
  const [blackBordered, setBlackBordered] = useState(false);
  const [cardColors, setCardColors] = useState<ColorSymbol[] | null>(null);
  const [cardName, setCardName] = useState('Colossal Dreadmaw');
  const [cardVariant, setCardVariant] = useSetting('cardVariant');

  const { card, referenceImageUrl, loading, error } = useCardData(cardName);
  // The colors picked override the face's, to try the color treatments
  const face = useMemo(
    () => card && (cardColors ? { ...card.mainFace, colors: cardColors } : card.mainFace),
    [card, cardColors],
  );

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    const input = e.currentTarget.elements.namedItem('cardName') as HTMLInputElement;
    setCardName(input.value);
  };
  const handleStyleChange = (e: ChangeEvent<HTMLSelectElement>) => setCardVariant(e.target.value as CardStyle);
  const handleColorChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setCardColors(value === '' ? null : value === 'none' ? [] : value.split(',').filter(isColorSymbol));
  };
  const handleBorderChange = (e: ChangeEvent<HTMLSelectElement>) => setBlackBordered(e.target.value === 'black');
  const handleReferenceChange = (e: ChangeEvent<HTMLInputElement>) => setOpacity(parseFloat(e.target.value));

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

            <Card
              cardStyle={cardVariant}
              face={face}
              subFace={getSubCardPosition(card) ? card.secondaryFace : undefined}
              subFacePosition={getSubCardPosition(card)}
              blackBordered={blackBordered}
            />
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
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="workbench-field">
            <label htmlFor="cardColors">Color</label>
            <select id="cardColors" defaultValue="" onChange={handleColorChange}>
              {COLOR_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="workbench-field">
            <label htmlFor="cardBorder">Border</label>
            <select id="cardBorder" value={blackBordered ? 'black' : 'white'} onChange={handleBorderChange}>
              <option value="white">White border</option>
              <option value="black">Black border</option>
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

export default Workbench;
