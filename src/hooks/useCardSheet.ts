import { useMemo } from 'react';
import { groupCardsIntoSheets, type CollectionCard, type SheetConfig } from '../domain/press';

/**
 * Memoized {@link groupCardsIntoSheets}.
 */
export const useCardSheet = (cards: CollectionCard[], { sheetSize, splitCardTreatment, doubleFacedCardTreatment }: SheetConfig = {}) => {
  return useMemo(
    () => groupCardsIntoSheets(cards, { sheetSize, splitCardTreatment, doubleFacedCardTreatment }),
    [cards, sheetSize, splitCardTreatment, doubleFacedCardTreatment],
  );
};
