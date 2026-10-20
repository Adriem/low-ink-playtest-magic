import { useMemo } from 'react';
import { groupCardsIntoSheets, type CollectionCard, type SheetConfig } from '../domain/press';

/**
 * Memoized {@link groupCardsIntoSheets}.
 */
export const useCardSheet = (cards: CollectionCard[], { sheetSize, doubleFacedCardTreatment }: SheetConfig = {}) => {
  return useMemo(
    () => groupCardsIntoSheets(cards, { sheetSize, doubleFacedCardTreatment }),
    [cards, sheetSize, doubleFacedCardTreatment],
  );
};
