import { useState } from 'react';
import Card from '../cards/Card';
import useCardData from './useCardData';
import Reference from './Reference';
import { useSetting } from '../settings';

import './Workbench.css';

const Workbench = () => {
  const [opacity, setOpacity] = useState(0);
  const [blackBordered, setBlackBordered] = useState(false);
  const [cardColors, setCardColors] = useState(null);
  const [cardName, setCardName] = useState('Colossal Dreadmaw');
  const [cardVariant, setCardVariant] = useSetting('cardVariant');

  const { cardData, loading, error } = useCardData(cardName);

  return (
    <div className="workbench">
      {(!cardData || Object.keys(cardData).length === 0) ? <div>NO CARD DATA</div>
        : (loading) ? <div>LOADING...</div>
          : (error) ? <div>ERROR ({error.name}): {error.message}</div>
            : (
              <div className="workbench">
                <div style={{
                  position: 'absolute',
                  width: '500px',
                  zIndex: '10',
                  opacity,
                }}>
                  <Reference imageUrl={cardData.image_uris?.normal} />
                </div>

                <div style={{ marginTop: '-2px', zIndex: '0' }}>
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
              </div>
            )}
      <div style={{ position: 'fixed', bottom: 10, right: 10 }}>
        <form action="#" style={{display: 'inline-block', padding: '0 1em' }} onSubmit={(e) => setCardName(e.target.cardName.value)}>
          <label htmlFor="cardName">Card name</label>
          <input id="cardName" style={{ width: '18em' }} type="text" />
          <input type="submit" value="Search" />
        </form>
        <div style={{display: 'inline-block', padding: '0 1em'}}>
          <input id="blackBordered" type="checkbox" onChange={(e) => setBlackBordered(e.target.checked)} />
          <label htmlFor="blackBordered">Black border</label>
        </div>
        <select
          name="cardVariant"
          value={cardVariant}
          onChange={(e) => setCardVariant(e.target.value)}
          style={{ marginRight: '0.5em' }}
        >
          <option value="realistic">Realistic</option>
          <option value="minimalist">Minimalist</option>
        </select>
        <select
          name="borderColor"
          defaultValue=""
          onChange={(e) => {
            const { value } = e.target;
            setCardColors(value === '' ? null : value === 'none' ? [] : value.split(','));
          }}
        >
          <option value="">default</option>
          <option value="none">none</option>
          <option value="W">white</option>
          <option value="U">blue</option>
          <option value="B">black</option>
          <option value="R">red</option>
          <option value="G">green</option>
          <option value="W,U,B,R,G">multi</option>
          <option value="R,G">gruul</option>
          <option value="U,R">izzet</option>
          <option value="W,B">orzhov</option>
          <option value="G,U">simic</option>
          <option value="G,B">golgari</option>
          <option value="W,U">azorius</option>
          <option value="W,G">selesnya</option>
          <option value="B,R">rakdos</option>
          <option value="B,U">dimir</option>
          <option value="W,R">boros</option>
        </select>
        <label htmlFor="referenceOpacity" style={{ marginLeft: '1em' }}>Reference</label>
        <input
          id="referenceOpacity"
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={opacity}
          onChange={(e) => setOpacity(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};

export default Workbench;