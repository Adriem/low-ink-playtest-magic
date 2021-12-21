import { useEffect, useState } from 'react';
import CanvasCard from './CanvasCard';
import Card from './Card';
import useCardData from './hooks/useCardData';
import Reference from './Reference';

const Workbench = () => {
  const [opacity, setOpacity] = useState(0);
  const [blackBordered, setBlackBordered] = useState(false);
  const [cardColors, setCardColors] = useState(null);
  const [cardName, setCardName] = useState('Colossal Dreadmaw');

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
                  <Reference multiverseId={cardData.multiverse_ids[0]}/>
                </div>

                <div style={{ marginTop: '-2px', zIndex: '0' }}>
                  {/*<Card*/}
                  <CanvasCard
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
        <select name="borderColor" defaultValue="" onChange={(e) => setCardColors(e.target.value)}>
          <option value="">default</option>
          <option value={[]}>none</option>
          <option value={["W"]}>white</option>
          <option value={["U"]}>blue</option>
          <option value={["B"]}>black</option>
          <option value={["R"]}>red</option>
          <option value={["G"]}>green</option>
          <option value={["W","U","B","R","G"]}>multi</option>
          <option value={["R","G"]}>gruul</option>
          <option value={["U","R"]}>izzet</option>
          <option value={["W","B"]}>orzhov</option>
          <option value={["G","U"]}>simic</option>
          <option value={["G","B"]}>golgari</option>
          <option value={["W","U"]}>azorius</option>
          <option value={["W","G"]}>selesnya</option>
          <option value={["B","R"]}>rakdos</option>
          <option value={["B","U"]}>dimir</option>
          <option value={["W","R"]}>boros</option>
        </select>
        <button onClick={() => setOpacity(1)}>Opaque</button>
        <button onClick={() => setOpacity(0.5)}>Transparent</button>
        <button onClick={() => setOpacity(0)}>Invisible</button>
      </div>
    </div>
  );
};

export default Workbench;