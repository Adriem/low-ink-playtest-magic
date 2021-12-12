import { useLayoutEffect, useRef } from 'react';

import './Card.css';
import './ColorIdentities.css';
import './Symbols.css';

const useAutoShrinkText = (ref, textContent, minSize = 0) => {
  useLayoutEffect(() => {
    const cardTitleElem = ref.current;

    cardTitleElem.style.fontSize = '';

    while (Number.parseFloat(getComputedStyle(cardTitleElem).fontSize) > minSize
        && (cardTitleElem.offsetHeight < cardTitleElem.scrollHeight
          || cardTitleElem.offsetWidth < cardTitleElem.scrollWidth)) {
      const computedFontSize = cardTitleElem.style.fontSize !== ''
        ? Number.parseFloat(cardTitleElem.style.fontSize)
        : Number.parseFloat(getComputedStyle(cardTitleElem).fontSize);

      cardTitleElem.style.fontSize = `${computedFontSize - 1}px`;
    }
  }, [textContent]);
};

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
};

const formatTextSymbols = (text) => {
  return text
    .replace(/{(\d)}/g, '<span class="symbol mana generic">$1</span>')
    .replace(/{(\d\d)}/g, '<span class="symbol mana generic plus-10">$1</span>')
    .replace(/{C}/g, '<span class="symbol mana colorless"><i class="far fa-square"></i></span>')
    .replace(/{X}/g, '<span class="symbol mana colorless">X</span>')
    .replace(/{W}/g, '<span class="symbol mana white"><i class="fa fa-sun"></i></span>')
    .replace(/{U}/g, '<span class="symbol mana blue"><i class="fa fa-tint"></i></span>')
    .replace(/{B}/g, '<span class="symbol mana black"><i class="fa fa-skull"></i></span>')
    .replace(/{R}/g, '<span class="symbol mana red"><i class="fa fa-fire"></i></span>')
    .replace(/{G}/g, '<span class="symbol mana green"><i class="fa fa-tree"></i></span>')
    .replace(/{W\/U}/g, '<span class="symbol mana azorius"><i class="fa fa-percentage"></i></span>')
    .replace(/{W\/B}/g, '<span class="symbol mana orzhov"><i class="fa fa-percentage"></i></span>')
    .replace(/{R\/W}/g, '<span class="symbol mana boros"><i class="fa fa-percentage"></i></span>')
    .replace(/{G\/W}/g, '<span class="symbol mana selesnya"><i class="fa fa-percentage"></i></span>')
    .replace(/{U\/B}/g, '<span class="symbol mana dimir"><i class="fa fa-percentage"></i></span>')
    .replace(/{U\/R}/g, '<span class="symbol mana izzet"><i class="fa fa-percentage"></i></span>')
    .replace(/{G\/U}/g, '<span class="symbol mana simic"><i class="fa fa-percentage"></i></span>')
    .replace(/{B\/R}/g, '<span class="symbol mana rakdos"><i class="fa fa-percentage"></i></span>')
    .replace(/{B\/G}/g, '<span class="symbol mana golgari"><i class="fa fa-percentage"></i></span>')
    .replace(/{R\/G}/g, '<span class="symbol mana gruul"><i class="fa fa-percentage"></i></span>')
    .replace(/{P}/g, '<span class="symbol mana generic phyrexian"><i class="fa fa-ban"></i></span>')
    .replace(/{W\/P}/g, '<span class="symbol mana white phyrexian"><i class="fa fa-ban"></i></span>')
    .replace(/{U\/P}/g, '<span class="symbol mana blue phyrexian"><i class="fa fa-ban"></i></span>')
    .replace(/{B\/P}/g, '<span class="symbol mana black phyrexian"><i class="fa fa-ban"></i></span>')
    .replace(/{R\/P}/g, '<span class="symbol mana red phyrexian"><i class="fa fa-ban"></i></span>')
    .replace(/{G\/P}/g, '<span class="symbol mana green phyrexian"><i class="fa fa-ban"></i></span>')
    .replace(/{S}/g, '<span class="symbol mana generic snow"><i class="fa fa-snowflake"></i></span>')
    .replace(/{W\/S}/g, '<span class="symbol mana white snow"><i class="fa fa-snowflake"></i></span>')
    .replace(/{U\/S}/g, '<span class="symbol mana blue snow"><i class="fa fa-snowflake"></i></span>')
    .replace(/{B\/S}/g, '<span class="symbol mana black snow"><i class="fa fa-snowflake"></i></span>')
    .replace(/{R\/S}/g, '<span class="symbol mana red snow"><i class="fa fa-snowflake"></i></span>')
    .replace(/{G\/S}/g, '<span class="symbol mana green snow"><i class="fa fa-snowflake"></i></span>')
    .replace(/{T}/g, '<span class="symbol generic tap"><i class="fa fa-share"></i></span>')
    .replace(/{Q}/g, '<span class="symbol generic untap"><i class="fa fa-share"></i></span>')
    .replace(/\((.*?)\)/g, '<i>($1)</i>');
};

const Card = ({
  cardName,
  cardManaCost,
  cardArtUrl,
  cardColors,
  cardTypeLine,
  cardOracleText,
  cardPower,
  cardToughness,
  cardLoyalty,
  cardSet = 'PXY',
  devoid,
  blackBordered,
}) => {
  const borderColor = getColorMappings(cardColors, cardTypeLine);

  const cardTitleRef = useRef();
  const cardTypeRef = useRef();
  const cardOracleTextRef = useRef();

  useAutoShrinkText(cardTitleRef, cardName);
  useAutoShrinkText(cardTypeRef, cardTypeLine);
  useAutoShrinkText(cardOracleTextRef, cardOracleText);

  return (
    <div className={`card ${borderColor || ''} ${devoid ? 'devoid' : ''}`}>
      <div className={`card-frame ${blackBordered ? 'black-bordered' : ''}`}>
        <div className="card-background">

          <div className="card-title-box">
            <div className="card-rounded-box-border color-identity-border">
              <div className="card-rounded-box-content">
                <div ref={cardTitleRef} className="card-title shrink-text-size">{cardName}</div>
                <div className="card-mana-cost" dangerouslySetInnerHTML={{
                  __html: formatTextSymbols(cardManaCost)
                }} />
              </div>
            </div>
          </div>

          <div className="card-art-box">
            <div className="card-square-box-border color-identity-border">
              <div className="card-square-box-content">
                <img className="card-art-image" alt="Card art" src={cardArtUrl} />
              </div>
            </div>
          </div>

          <div className="card-type-box">
            <div className="card-rounded-box-border color-identity-border">
              <div className="card-rounded-box-content">
                <div ref={cardTypeRef} className="card-type shrink-text-size">{cardTypeLine}</div>
                <div className="card-expansion-symbol">{cardSet}</div>
              </div>
            </div>
          </div>

          <div className="card-oracle-text-box">
            <div className="card-square-box-border color-identity-border">
              <div className="card-square-box-content">
                <div ref={cardOracleTextRef} className="card-oracle-text shrink-text-size">
                    {(cardOracleText || '').split('\n').map(paragraph => (
                      <p dangerouslySetInnerHTML={{ __html: formatTextSymbols(paragraph) }} />
                    ))}
                </div>
              </div>
            </div>
          </div>

          {(cardPower != null && cardToughness != null || cardLoyalty) && (
            <div className="card-stats-box">
              <div className="card-rounded-box-border color-identity-border">
                <div className="card-rounded-box-content">
                  <div className="card-stats">
                    {cardLoyalty ? cardLoyalty : `${cardPower}/${cardToughness}`}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Card;