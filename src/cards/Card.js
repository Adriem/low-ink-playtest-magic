import { useEffect, useState } from 'react';
import { beginRender, finishRender } from '../utils/canvasRendering';
import { CARD_HEIGHT, CARD_WIDTH, getCardRenderer } from './styles';
import { InkColors } from '../utils/colors';

/**
 * Card drawn on a canvas in the given style. The canvas is marked as rendered
 * (`data-rendered`) once all its images have been drawn.
 *
 * @param {object} props - The card's props (see `CardProps`), plus:
 * @param {string} props.cardStyle - e.g. `realistic` or `minimalist`
 */
const Card = ({
  cardStyle,
  cardName,
  cardManaCost,
  cardArtUrl,
  cropArt,
  cardColors,
  cardTypeLine,
  cardOracleText,
  cardPower,
  cardToughness,
  cardLoyalty,
  cardSet,
  devoid,
  blackBordered,
  subCardPosition,
  subCard,
}) => {
  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    if (canvas == null) return;

    beginRender(canvas);
    getCardRenderer(cardStyle)(canvas, {
      cardName,
      cardManaCost,
      cardArtUrl,
      cropArt,
      cardColors,
      cardTypeLine,
      cardOracleText,
      cardPower,
      cardToughness,
      cardLoyalty,
      cardSet,
      devoid,
      blackBordered,
      subCardPosition,
      subCard,
    });
    void finishRender(canvas);
  }, [
    canvas,
    cardStyle,
    cardName,
    cardManaCost,
    cardArtUrl,
    cropArt,
    cardColors,
    cardTypeLine,
    cardOracleText,
    cardPower,
    cardToughness,
    cardLoyalty,
    cardSet,
    devoid,
    blackBordered,
    subCardPosition,
    subCard,
  ]);

  return (
    <canvas
      className="card"
      ref={setCanvas}
      width={CARD_WIDTH}
      height={CARD_HEIGHT}
      style={{ background: InkColors.PAPER }}
    />
  );
};

export default Card;
