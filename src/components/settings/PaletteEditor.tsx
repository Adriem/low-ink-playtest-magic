import { useMemo, type ChangeEvent, type FormEvent } from 'react';
import { resolvePalette } from '../cards/common/canvasStyles';
import { DEFAULT_PALETTES } from '../cards/palettes';
import type { CardStyle } from '../cards/styles';
import { SETTINGS_DEFINITIONS, usePaletteEditor } from './SettingsContext';

/** Names of the colors of the palettes, by their key */
const COLOR_LABELS: Record<string, string> = {
  TEXT: 'Text',
  LINE: 'Lines',
  PAPER: 'Paper',
  COLORLESS: 'Colorless',
  WHITE: 'White',
  BLUE: 'Blue',
  BLACK: 'Black',
  RED: 'Red',
  GREEN: 'Green',
  GOLD: 'Gold',
  ARTIFACT: 'Artifact',
  LAND: 'Land',
  COLORLESS_TYPELINE_TEXT: 'Colorless type line text',
};

/**
 * Editor of a card style's palette: a color picker for each of its colors,
 * marked while changed and not saved. The cards show the changes as they're
 * made, and they're saved together, or discarded, or the colors restored to
 * the style's defaults.
 */
const PaletteEditor = ({ cardStyle }: { cardStyle: CardStyle }) => {
  const defaultPalette: Record<string, string> = DEFAULT_PALETTES[cardStyle];
  // The cards are drawn with the colors being edited, and those are saved on their own
  const { savedPalette, previewedPalette, preview, save, discard } = usePaletteEditor(cardStyle);
  const savedColors = useMemo(() => resolvePalette(defaultPalette, savedPalette), [defaultPalette, savedPalette]);
  const colors = previewedPalette ? resolvePalette(defaultPalette, previewedPalette) : savedColors;
  const cardStyleLabel = SETTINGS_DEFINITIONS.cardVariant.options.find(({ value }) => value === cardStyle)?.label;

  const handleColorChange = (event: ChangeEvent<HTMLInputElement>) => {
    preview({ ...colors, [event.target.name]: event.target.value });
  };

  const handleRestoreClick = () => {
    preview({ ...defaultPalette });
  };

  const handleDiscardChangesClick = () => {
    discard();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    save(colors);
  };

  return (
    <form onSubmit={handleSubmit}>
      <fieldset className="palette-editor">
        <legend>{cardStyleLabel} palette</legend>
        {Object.entries(colors).map(([name, color]) => (
          <label key={name} className="palette-color">
            <span>
              {COLOR_LABELS[name] ?? name}
              {color !== savedColors[name] && <span className="modified-dot" title="Changed" aria-hidden="true" />}
            </span>
            <input type="color" name={name} value={color} onChange={handleColorChange} />
          </label>
        ))}
        <div className="palette-restore">
          <button type="button" onClick={handleRestoreClick}>
            Restore defaults
          </button>
        </div>
      </fieldset>
      <menu>
        <button type="button" onClick={handleDiscardChangesClick}>
          Discard changes
        </button>
        <button type="submit">Save</button>
      </menu>
    </form>
  );
};

export default PaletteEditor;
