import { useState } from 'react';
import Card from './Card';
import Reference from './Reference';

import './App.css';

function App() {
  const [opacity, setOpacity] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState(null);
  const [borderColor, setBorderColor] = useState(null);
  const [cardName, setCardName] = useState('Colossal Dreadmaw');

  return (
    <div className="App">
      <div style={{
        position: 'absolute',
        width: '500px',
        padding: '10px',
        zIndex: '10',
        opacity,
      }}>
        <Reference />
      </div>
      <div style={{
        position: 'absolute',
        width: '500px',
        padding: '10px',
        zIndex: '0',
      }}>

        {/*<Card cardName="Emrakul, the Aeons Torn" borderColor={borderColor} backgroundColor={backgroundColor} devoid={devoid} />*/}
        <Card cardName={cardName} borderColor={borderColor} backgroundColor={backgroundColor} />

      </div>
      <div style={{ position: 'fixed', bottom: 10, right: 10 }}>
        <form action="#" style={{display: 'inline-block', padding: '0 1em' }} onSubmit={(e) => setCardName(e.target.cardName.value)}>
          <label htmlFor="cardName">Card name</label>
          <input id="cardName" style={{ width: '20em' }} type="text" />
          <input type="submit" value="Search" />
        </form>
        {/*<div style={{display: 'inline-block', padding: '0 1em'}}>*/}
        {/*  <input id="devoid" type="checkbox" onChange={(e) => setDevoid(e.target.checked)} />*/}
        {/*  <label htmlFor="devoid">Devoid</label>*/}
        {/*</div>*/}
        <select name="borderColor" onChange={(e) => setBorderColor(e.target.value)}>
          <option value="" selected>default</option>
          <option>none</option>
          <option>white</option>
          <option>blue</option>
          <option>black</option>
          <option>red</option>
          <option>green</option>
          <option>multi</option>
          <option>artifact</option>
          <option>gruul</option>
          <option>izzet</option>
          <option>orzhov</option>
          <option>simic</option>
          <option>golgari</option>
          <option>azorius</option>
          <option>selesnya</option>
          <option>rakdos</option>
          <option>dimir</option>
          <option>boros</option>
        </select>
        <button onClick={() => setOpacity(1)}>Opaque</button>
        <button onClick={() => setOpacity(0.25)}>Transparent</button>
        <button onClick={() => setOpacity(0)}>Invisible</button>
      </div>
    </div>
  );
}

export default App;
