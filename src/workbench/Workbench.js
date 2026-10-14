import { useState } from 'react';
import Card from '../cards/Card';
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
  const [cardColors, setCardColors] = useState(null);
  const [cardName, setCardName] = useState('Colossal Dreadmaw');
  const [cardVariant, setCardVariant] = useSetting('cardVariant');

  const { cardData, loading, error } = useCardData(cardName);

  const handleSearchSubmit = (e) => setCardName(e.target.cardName.value);
  const handleStyleChange = (e) => setCardVariant(e.target.value);
  const handleColorChange = (e) => {
    const { value } = e.target;
    setCardColors(value === '' ? null : value === 'none' ? [] : value.split(','));
  };
  const handleBorderChange = (e) => setBlackBordered(e.target.value === 'black');
  const handleReferenceChange = (e) => setOpacity(parseFloat(e.target.value));

  return (
    <>
      <div className="workbench">
        {(!cardData || Object.keys(cardData).length === 0) ? <div>NO CARD DATA</div>
          : (loading) ? <div>LOADING...</div>
            : (error) ? <div>ERROR ({error.name}): {error.message}</div>
              : (
                <div className="workbench-card">
                  <div className="workbench-reference" style={{ opacity }}>
                    <Reference imageUrl={cardData.image_uris?.normal} />
                  </div>

                  <Card
                    cardStyle={cardVariant}
                    cardName={cardData.name}
                    cardManaCost={cardData.mana_cost}
                    cardColors={cardColors || cardData.colors}
                    cardOracleText={cardData.oracle_text}
                    cardTypeLine={cardData.type_line}
                    cardArtUrl={cardData.image_uris.art_crop}
                    cardLoyalty={cardData.loyalty}
                    cardPower={cardData.power}
                    cardToughness={cardData.toughness}
                    cardSet={cardData.set.toUpperCase()}
                    blackBordered={blackBordered}
                    subCardPosition={cardData._subFace ? (cardData.layout === 'prepare' ? 'right' : 'left') : null}
                    subCard={cardData._subFace}
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
              {SETTINGS_DEFINITIONS.cardVariant.options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <div className="workbench-field">
            <label htmlFor="cardColors">Color</label>
            <select id="cardColors" defaultValue="" onChange={handleColorChange}>
              {COLOR_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
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
