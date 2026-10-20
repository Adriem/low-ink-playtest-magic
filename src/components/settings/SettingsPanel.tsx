import { useState, type ChangeEvent, type Ref } from 'react';
import type { CardStyle } from '../cards/styles';
import { Popup } from '../popup';
import {
  SETTING_NAMES,
  SETTINGS_DEFINITIONS,
  isSettingAvailable,
  useDiscardPalettePreviews,
  useRestoreDefaultSettings,
  useSetting,
  type SettingName,
} from './SettingsContext';
import PaletteEditor from './PaletteEditor';

import './SettingsPanel.css';

const SettingsPanel = ({ ref }: { ref?: Ref<HTMLDialogElement> }) => {
  const [cardStyle] = useSetting('cardVariant');
  const restoreDefaults = useRestoreDefaultSettings();
  const discardPalettePreviews = useDiscardPalettePreviews();
  // The card style whose palette is being edited, which replaces the settings
  const [editedPalette, setEditedPalette] = useState<CardStyle | null>(null);

  const handleRestoreDefaultsClick = () => {
    restoreDefaults();
  };

  const handlePaletteClick = (paletteCardStyle: CardStyle) => {
    setEditedPalette(paletteCardStyle);
  };

  // Back from the palette editor, to the settings
  const handleBack = () => {
    setEditedPalette(null);
  };

  // The popup opens on the settings again, and the palette changes not saved are discarded
  const handleClose = () => {
    setEditedPalette(null);
    discardPalettePreviews();
  };

  return (
    <Popup ref={ref} hasCloseButton onBack={editedPalette ? handleBack : undefined} onClose={handleClose}>
      {editedPalette ? (
        <PaletteEditor cardStyle={editedPalette} />
      ) : (
        <SettingsForm
          cardStyle={cardStyle}
          onPaletteClick={handlePaletteClick}
          onRestoreDefaultsClick={handleRestoreDefaultsClick}
        />
      )}
    </Popup>
  );
};

/**
 * The settings, with a button to restore their defaults.
 */
const SettingsForm = ({
  cardStyle,
  onPaletteClick,
  onRestoreDefaultsClick,
}: {
  cardStyle: CardStyle;
  onPaletteClick: (cardStyle: CardStyle) => void;
  onRestoreDefaultsClick: () => void;
}) => {
  return (
    <form method="dialog">
      {SETTING_NAMES.map((name) =>
        name === 'cardVariant' ? (
          <CardStyleFieldset key={name} onPaletteClick={onPaletteClick} />
        ) : (
          // Settings that don't apply to the card style stay, disabled, so the panel keeps its size
          <SettingFieldset key={name} name={name} disabled={!isSettingAvailable(name, cardStyle)} />
        ),
      )}
      <menu className="menu-centered">
        <button type="button" onClick={onRestoreDefaultsClick}>
          Restore defaults
        </button>
      </menu>
    </form>
  );
};

/**
 * Radio buttons to pick the card style, one per line, each with a button to
 * edit its palette.
 */
const CardStyleFieldset = ({ onPaletteClick }: { onPaletteClick: (cardStyle: CardStyle) => void }) => {
  const definition = SETTINGS_DEFINITIONS.cardVariant;
  const [value, setValue] = useSetting('cardVariant');

  return (
    <fieldset className="card-styles">
      <legend>{definition.label}</legend>
      {definition.options.map((option) => (
        <div key={option.value} className="card-style">
          <label>
            <input
              type="radio"
              name="cardVariant"
              value={option.value}
              checked={value === option.value}
              onChange={() => setValue(option.value)}
            />
            {option.label}
          </label>
          <button
            type="button"
            aria-label={`Edit ${option.label} palette`}
            onClick={() => onPaletteClick(option.value)}
          >
            Edit palette
          </button>
        </div>
      ))}
    </fieldset>
  );
};

/**
 * Controls to pick the value of a setting: radio buttons, or a slider.
 */
const SettingFieldset = <Name extends SettingName>({ name, disabled = false }: { name: Name; disabled?: boolean }) => {
  const definition = SETTINGS_DEFINITIONS[name];
  const [value, setValue] = useSetting(name);

  if (definition.control === 'slider') return <SettingSlider name={name} disabled={disabled} />;

  return (
    <fieldset disabled={disabled || definition.disabled}>
      <legend>{definition.label}</legend>
      {definition.options.map((option) => (
        <label key={option.value}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => setValue(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
};

/**
 * Slider through the options of a setting, in order.
 */
const SettingSlider = <Name extends SettingName>({ name, disabled }: { name: Name; disabled: boolean }) => {
  const definition = SETTINGS_DEFINITIONS[name];
  const [value, setValue] = useSetting(name);
  const index = definition.options.findIndex((option) => option.value === value);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(definition.options[Number(event.target.value)].value);
  };

  return (
    <fieldset className="setting-slider" disabled={disabled || definition.disabled}>
      <legend>{definition.label}</legend>
      <input
        type="range"
        min={0}
        max={definition.options.length - 1}
        step={1}
        value={index}
        aria-label={definition.label}
        aria-valuetext={definition.options[index]?.label}
        onChange={handleChange}
      />
    </fieldset>
  );
};

export default SettingsPanel;
