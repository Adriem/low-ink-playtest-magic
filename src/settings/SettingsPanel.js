import { forwardRef } from 'react';
import { useSetting } from './SettingsContext';

const SettingsPanel = forwardRef((_props, ref) => {
  const [cardVariant, setCardVariant] = useSetting('cardVariant');
  const [splitCardTreatment, setSplitCardTreatment] = useSetting('splitCardTreatment');
  const [doubleFacedCardTreatment, setDoubleFacedCardTreatment] = useSetting('doubleFacedCardTreatment');
  const [inkLevel, setInkLevel] = useSetting('inkLevel');

  return (
    <dialog ref={ref}>
      <form method="dialog">
        <fieldset>
          <legend>Card style</legend>
          <label>
            <input
              type="radio"
              name="cardVariant"
              value="original"
              checked={cardVariant === 'original'}
              onChange={() => setCardVariant('original')}
            />
            Original
          </label>
          <label>
            <input
              type="radio"
              name="cardVariant"
              value="minimalist"
              checked={cardVariant === 'minimalist'}
              onChange={() => setCardVariant('minimalist')}
            />
            Minimalist
          </label>
        </fieldset>
        <fieldset>
          <legend>Split card treatment</legend>
          <label>
            <input
              type="radio"
              name="splitCardTreatment"
              value="unified"
              checked={splitCardTreatment === 'unified'}
              onChange={() => setSplitCardTreatment('unified')}
            />
            Unified
          </label>
          <label>
            <input
              type="radio"
              name="splitCardTreatment"
              value="separate"
              checked={splitCardTreatment === 'separate'}
              onChange={() => setSplitCardTreatment('separate')}
            />
            Separate
          </label>
        </fieldset>
        <fieldset>
          <legend>Double-Faced card treatment</legend>
          <label>
            <input
              type="radio"
              name="doubleFacedCardTreatment"
              value="unified"
              checked={doubleFacedCardTreatment === 'unified'}
              onChange={() => setDoubleFacedCardTreatment('unified')}
            />
            Unified
          </label>
          <label>
            <input
              type="radio"
              name="doubleFacedCardTreatment"
              value="separate"
              checked={doubleFacedCardTreatment === 'separate'}
              onChange={() => setDoubleFacedCardTreatment('separate')}
            />
            Separate
          </label>
        </fieldset>
        <fieldset disabled>
          <legend>Ink level</legend>
          <label>
            <input
              type="radio"
              name="inkLevel"
              value="low"
              checked={inkLevel === 'low'}
              onChange={() => setInkLevel('low')}
            />
            Low
          </label>
          <label>
            <input
              type="radio"
              name="inkLevel"
              value="medium"
              checked={inkLevel === 'medium'}
              onChange={() => setInkLevel('medium')}
            />
            Medium
          </label>
          <label>
            <input
              type="radio"
              name="inkLevel"
              value="splurge"
              checked={inkLevel === 'splurge'}
              onChange={() => setInkLevel('splurge')}
            />
            Splurge
          </label>
        </fieldset>
        <menu>
          <button type="submit">Close</button>
        </menu>
      </form>
    </dialog>
  );
});

export default SettingsPanel;
