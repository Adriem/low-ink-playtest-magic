import { useEffect, useState } from 'react';

const getColorMappings = (cardColors, cardTypeLine) => {
  if (!cardColors) return '';
  if (cardColors.length === 0 && /artifact/i.test(cardTypeLine)) return 'artifact';
  if (cardColors.length === 0 && /land/i.test(cardTypeLine)) return 'land';
  if (cardColors.length === 0) return 'colorless';

  if (cardColors.length === 1 && cardColors.includes('W')) return 'white';
  if (cardColors.length === 1 && cardColors.includes('U')) return 'blue';
  if (cardColors.length === 1 && cardColors.includes('B')) return 'black';
  if (cardColors.length === 1 && cardColors.includes('R')) return 'red';
  if (cardColors.length === 1 && cardColors.includes('G')) return 'green';

  if (cardColors.length === 2 && cardColors.includes('W') && cardColors.includes('U')) return 'azorius';
  if (cardColors.length === 2 && cardColors.includes('W') && cardColors.includes('B')) return 'orzhov';
  if (cardColors.length === 2 && cardColors.includes('W') && cardColors.includes('R')) return 'boros';
  if (cardColors.length === 2 && cardColors.includes('W') && cardColors.includes('G')) return 'selesnya';
  if (cardColors.length === 2 && cardColors.includes('U') && cardColors.includes('B')) return 'dimir';
  if (cardColors.length === 2 && cardColors.includes('U') && cardColors.includes('R')) return 'izzet';
  if (cardColors.length === 2 && cardColors.includes('U') && cardColors.includes('G')) return 'simic';
  if (cardColors.length === 2 && cardColors.includes('B') && cardColors.includes('R')) return 'rakdos';
  if (cardColors.length === 2 && cardColors.includes('B') && cardColors.includes('G')) return 'golgari';
  if (cardColors.length === 2 && cardColors.includes('R') && cardColors.includes('G')) return 'gruul';

  if (cardColors.length > 2) return 'multi';
}

const Card = ({
  cardName,
  borderColor,
  backgroundColor,
  devoid,
  blackBordered,
}) => {
  const [cardData, setCardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!cardName) return;

    setLoading(true);

    fetch(`https://api.scryfall.com/cards/named?exact=${encodeURIComponent(cardName)}`)
      .then(async r => r.ok ? await r.json() : Promise.reject(await r.json()))
      .then(data => {
        setLoading(false);
        setError(null);
        setCardData(data);
      })
      .catch(error => {
        setLoading(false);
        setError(error);
      });
  }, [cardName]);

  if (!cardData || Object.keys(cardData).length === 0) return <div>NO CARD DATA</div>
  if (loading) return <div>LOADING...</div>
  if (error) return <div>ERROR ({error.name}): {error.message}</div>

  borderColor = borderColor || getColorMappings(cardData.colors, cardData.type_line);

  return (
    <div className="card-container" style={{
      position: 'relative',
      width: '100%',
      paddingTop: '140%',
      fontFamily: 'serif',
    }}>
      <div className="card-frame" style={{
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        border: '4px solid black',
        borderRadius: '4.9%/3.5%',
        backgroundColor: blackBordered ? 'black' : 'white',
      }}>
        <div className={`card-background ${backgroundColor || ''} ${devoid ? 'devoid' : ''}`} style={{
          position: 'absolute',
          top: '2%',
          bottom: '9%',
          left: '3%',
          right: '3%',
          border: '2px solid black',
          borderTopLeftRadius: '2.8% 2%',
          borderTopRightRadius: '2.8% 2%',
          borderBottomRightRadius: '9% 8%',
          borderBottomLeftRadius: '9% 8%',
        }}>

          <div className={`card-title-border content-border ${borderColor || ''} ${devoid ? 'devoid' : ''}`} style={{
            position: 'absolute',
            top: '1.5%',
            height: '6.75%',
            left: '1%',
            right: '1%',
            borderRadius: '2.5% / 50%',
            padding: '.75%',
          }}>
            <div className="card-title-box" style={{
              borderRadius: '2.5% / 50%',
              backgroundColor: 'white',
              width: '100%',
              height: '100%',
              border: '2px solid black',
              boxSizing: 'border-box',
              display: 'flex',
              padding: '1%',
              fontWeight: 'bold',
              fontSize: '175%'
            }}>
              <div className="card-title-container" style={{ padding: '0 1.5%' }}>{cardData.name}</div>
              <div style={{ flex: 1 }} />
              <div className="card-mana-container">{cardData.mana_cost.replace(/[{}]/g, '')}</div>
            </div>
          </div>

          <div className={`card-art-border content-border ${borderColor || ''} ${devoid ? 'devoid' : ''}`} style={{
            position: 'absolute',
            top: '9%',
            height: '51%',
            left: '3%',
            right: '3%',
            padding: '0.5% 1%'
          }}>
            <div className="card-art-box" style={{
              backgroundColor: 'white',
              width: '100%',
              height: '100%',
              border: '2px solid black',
              boxSizing: 'border-box',
            }}>
              <img
                alt="Art"
                src={cardData.image_uris.art_crop}
                height="100%"
                width="100%"
                style={{
                  filter: 'brightness(1.5) grayscale(1) contrast(20)',
                  opacity: '0.5',
                }}
              />
            </div>
          </div>

          <div className={`card-type-border content-border ${borderColor || ''} ${devoid ? 'devoid' : ''}`} style={{
            position: 'absolute',
            top: '60.5%',
            height: '6.75%',
            left: '1%',
            right: '1%',
            borderRadius: '2.5% / 50%',
            padding: '.75%',
          }}>
            <div className="card-type-box" style={{
              borderRadius: '2.5% / 50%',
              backgroundColor: 'white',
              width: '100%',
              height: '100%',
              border: '2px solid black',
              boxSizing: 'border-box',
              display: 'flex',
              padding: '1%',
              fontWeight: 'bold',
              fontSize: '140%'
            }}>
              <div className="card-type-container" style={{ padding: '0 1.5%' }}>{cardData.type_line}</div>
              <div style={{ flex: 1 }} />
              <div className="card-set-container">[P]</div>
            </div>
          </div>

          <div className={`card-oracle-border content-border ${borderColor || ''} ${devoid ? 'devoid' : ''}`} style={{
            position: 'absolute',
            top: '68%',
            height: '34%',
            left: '3%',
            right: '3%',
            padding: '0.5% 1% 1%'
          }}>
            <div className="card-oracle-box" style={{
              backgroundColor: 'white',
              width: '100%',
              height: '100%',
              border: '2px solid black',
              boxSizing: 'border-box',
              fontSize: '140%',
              lineHeight: .9,
              padding: '5% 1%',
            }}>
              {(cardData.oracle_text || '').split('\n').map(paragraph => (
                <p style={{ margin: '1.5% 0' }}>{paragraph}</p>
              ))}
            </div>
          </div>

          {(cardData.power != null && cardData.toughness != null || cardData.loyalty) && (
            <div className={`card-stats-border content-border ${borderColor || ''} ${devoid ? 'devoid' : ''}`} style={{
              position: 'absolute',
              top: '98%',
              height: '6%',
              width: '17%',
              right: '1.5%',
              borderRadius: '8.5% / 50%',
              padding: '1%',
            }}>
              <div className="card-stats-box" style={{
                borderRadius: '8.5% / 50%',
                backgroundColor: 'white',
                width: '100%',
                height: '100%',
                border: '2px solid black',
                boxSizing: 'border-box',
                fontWeight: 'bold',
                fontSize: '190%',
                textAlign: 'center',
                lineHeight: 1,
              }}>
                {cardData.loyalty ? cardData.loyalty : `${cardData.power}/${cardData.toughness}`}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Card;