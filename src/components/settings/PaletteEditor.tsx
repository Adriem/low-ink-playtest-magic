import { useMemo, type ChangeEvent, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { resolvePalette } from '../cards/common/canvasStyles';
import { DEFAULT_PALETTES } from '../cards/palettes';
import type { CardStyle } from '../cards/styles';
import { SETTINGS_DEFINITIONS, usePaletteEditor } from './SettingsContext';

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
  const { t } = useTranslation();
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
        <legend>{t('palette_editor.title', { cardStyle: cardStyleLabel && t(cardStyleLabel) })}</legend>
        {Object.entries(colors).map(([name, color]) => (
          <label key={name} className="palette-color">
            <span>
              {/* By their key, in snake_case like the keys of the texts. Colors without a name of their own
                  go by their key */}
              {t(`palette_editor.colors.${name.toLowerCase()}`, { defaultValue: name })}
              {color !== savedColors[name] && (
                <span className="modified-dot" title={t('palette_editor.changed')} aria-hidden="true" />
              )}
            </span>
            <input type="color" name={name} value={color} onChange={handleColorChange} />
          </label>
        ))}
        <div className="palette-restore">
          <button type="button" onClick={handleRestoreClick}>
            {t('palette_editor.restore_defaults')}
          </button>
        </div>
      </fieldset>
      <menu>
        <button type="button" onClick={handleDiscardChangesClick}>
          {t('palette_editor.discard_changes')}
        </button>
        <button type="submit">{t('palette_editor.save')}</button>
      </menu>
    </form>
  );
};

export default PaletteEditor;
