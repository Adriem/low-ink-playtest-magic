import type { Orientation } from '../../../../domain/cards';
import type { Palette } from '../../../../domain/colorTreatment';
import {
  ORACLE_FONT_SIZE,
  ORACLE_TEXT_PADDING_X,
  ORACLE_TEXT_PADDING_Y,
  ORACLE_TEXT_STATS_CLEARANCE,
  PINLINE_THICKNESS,
  LANDSCAPE_ORACLE_TEXT_PADDING_Y,
  CARD_LAYOUTS,
} from '../config';
import { drawFramedBox } from './drawFramedBox';
import { drawOracleText } from './drawOracleText';
import type { CardColorTreatment } from '../../../../domain/colorTreatment';
import type { InkLevel, OracleLayout } from '../../styles';
import type { OracleText } from '../../../../domain/oracleText';

export const drawOracleBox = (
  ctx: CanvasRenderingContext2D,
  {
    palette,
    cardOracleText = { lines: [] },
    cardPower,
    cardToughness,
    cardColorTreatment,
    inkLevel,
    layout,
    orientation = 'portrait',
  }: {
    palette: Palette;
    cardOracleText?: OracleText;
    cardPower?: string;
    cardToughness?: string;
    cardColorTreatment: CardColorTreatment;
    inkLevel?: InkLevel;
    layout: OracleLayout;
    /** Which way the card is drawn: landscape cards (e.g. battles) are laid out sideways */
    orientation?: Orientation;
  },
) => {
  const cardLayout = CARD_LAYOUTS[orientation];
  const x = layout === 'right-half' ? cardLayout.width / 2 : (cardLayout.width - cardLayout.contentWidth) / 2;
  const y = cardLayout.oracleY;
  const width = layout === 'full-width' ? cardLayout.contentWidth : cardLayout.contentWidth / 2;
  const height = cardLayout.oracleHeight;

  drawFramedBox(ctx, {
    palette,
    x,
    y,
    width,
    height,
    cardColorTreatment,
    inkLevel,
    inkFillStrength: 'light',
    shape: 'rectangle',
    orientation,
  });

  // Landscape cards have little room for their text, so it has less space around it
  const isLandscape = orientation === 'landscape';
  const textPaddingX = ORACLE_TEXT_PADDING_X;
  const textPaddingTop = isLandscape ? LANDSCAPE_ORACLE_TEXT_PADDING_Y : ORACLE_FONT_SIZE + ORACLE_TEXT_PADDING_Y;
  const textPaddingBottom = isLandscape
    ? LANDSCAPE_ORACLE_TEXT_PADDING_Y
    : cardPower != null && cardToughness != null && layout !== 'left-half'
      ? ORACLE_TEXT_STATS_CLEARANCE
      : ORACLE_TEXT_PADDING_Y;

  drawOracleText(ctx, {
    palette,
    cardOracleText,
    x: x + PINLINE_THICKNESS + textPaddingX,
    y: y + PINLINE_THICKNESS + textPaddingTop,
    width: width - PINLINE_THICKNESS * 2 - textPaddingX * 2,
    height: height - PINLINE_THICKNESS * 2 - textPaddingTop - textPaddingBottom,
    fromTop: isLandscape,
  });
};
