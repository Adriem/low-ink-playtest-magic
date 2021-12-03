import { useState } from 'react';
import Card from './Card';
import Reference from './Reference';

import './App.css';

function App() {
  const [opacity, setOpacity] = useState(0.25);
  const [backgroundColor, setBackgroundColor] = useState(null);
  const [borderColor, setBorderColor] = useState(null);

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
        <Card borderColor={borderColor} backgroundColor={backgroundColor} />
      </div>
      <div style={{ position: 'fixed', bottom: 10, right: 10 }}>
        <select name="borderColor" onChange={(e) => setBorderColor(e.target.value)}>
          <option value="null" selected>none</option>
          <option>white</option>
          <option>blue</option>
          <option>black</option>
          <option>red</option>
          <option>green</option>
          <option>multi</option>
          <option>colorless</option>
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
        <select name="backgroundColor" onChange={(e) => setBackgroundColor(e.target.value)}>
          <option value="null" selected>none</option>
          <option>land</option>
          <option>white</option>
          <option>blue</option>
          <option>black</option>
          <option>red</option>
          <option>green</option>
          <option>multi</option>
          <option>colorless</option>
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
