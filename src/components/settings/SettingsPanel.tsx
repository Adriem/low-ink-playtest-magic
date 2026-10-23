import { useState, type ChangeEvent, type ReactNode, type Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { useFlag } from '../../hooks/useFlag';
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
  const { t } = useTranslation();

  const hasArtFidelitySlider = useFlag('ART_FIDELITY_SLIDER');
  const hiddenArtSetting: SettingName = hasArtFidelitySlider ? 'includeArt' : 'artFidelity';
  const names = SETTING_NAMES.filter((name) => !SETTINGS_DEFINITIONS[name].group && name !== hiddenArtSetting);

  return (
    <form method="dialog" className="settings-form">
      {names.map((name) =>
        name === 'cardVariant' ? (
          <CardStyleFieldset key={name} onPaletteClick={onPaletteClick} />
        ) : (
          // Settings that don't apply to the card style stay, disabled, so the panel keeps its size
          <SettingFieldset key={name} name={name} disabled={!isSettingAvailable(name, cardStyle)}>
            <GroupedSettings name={name} cardStyle={cardStyle} />
          </SettingFieldset>
        ),
      )}
      <menu className="menu-centered">
        <button type="button" onClick={onRestoreDefaultsClick}>
          {t('settings.restore_defaults')}
        </button>
      </menu>
    </form>
  );
};

/**
 * Checkboxes of the settings shown in the group of a setting, below its
 * options and a separator. Nothing for settings without any.
 */
const GroupedSettings = ({ name, cardStyle }: { name: SettingName; cardStyle: CardStyle }) => {
  const groupedNames = SETTING_NAMES.filter((groupedName) => SETTINGS_DEFINITIONS[groupedName].group === name);
  if (groupedNames.length === 0) return null;

  return (
    <>
      <hr className="setting-separator" />
      {groupedNames.map((groupedName) => (
        <SettingCheckbox key={groupedName} name={groupedName} disabled={!isSettingAvailable(groupedName, cardStyle)} />
      ))}
    </>
  );
};

/**
 * Radio buttons to pick the card style, one per line, each with a button to
 * edit its palette.
 */
const CardStyleFieldset = ({ onPaletteClick }: { onPaletteClick: (cardStyle: CardStyle) => void }) => {
  const { t } = useTranslation();
  const definition = SETTINGS_DEFINITIONS.cardVariant;
  const [value, setValue] = useSetting('cardVariant');

  return (
    <fieldset className="card-styles">
      <legend>{t(definition.label)}</legend>
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
            {t(option.label)}
          </label>
          <button
            type="button"
            aria-label={t('settings.edit_palette_of', { cardStyle: t(option.label) })}
            onClick={() => onPaletteClick(option.value)}
          >
            {t('settings.edit_palette')}
          </button>
        </div>
      ))}
    </fieldset>
  );
};

/**
 * Controls to pick the value of a setting: radio buttons, a slider, or a
 * checkbox.
 *
 * @param props.children - Controls of other settings shown in its group, below its radio buttons
 */
const SettingFieldset = <Name extends SettingName>({
  name,
  disabled = false,
  children,
}: {
  name: Name;
  disabled?: boolean;
  children?: ReactNode;
}) => {
  const { t } = useTranslation();
  const definition = SETTINGS_DEFINITIONS[name];
  const [value, setValue] = useSetting(name);

  if (definition.control === 'slider') return <SettingSlider name={name} disabled={disabled} />;

  return (
    <fieldset disabled={disabled || definition.disabled}>
      <legend>{t(definition.label)}</legend>
      {definition.control === 'checkbox' ? (
        <SettingCheckbox name={name} disabled={disabled} />
      ) : (
        definition.options.map((option) => (
          <label key={option.value} className="setting-option">
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => setValue(option.value)}
            />
            {t(option.label)}
          </label>
        ))
      )}
      {children}
    </fieldset>
  );
};

/**
 * A checkbox to switch a setting between its two options: unchecked for the
 * first one, checked for the second.
 */
const SettingCheckbox = <Name extends SettingName>({ name, disabled }: { name: Name; disabled: boolean }) => {
  const { t } = useTranslation();
  const definition = SETTINGS_DEFINITIONS[name];
  const [value, setValue] = useSetting(name);
  const [unchecked, checked] = definition.options;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue((event.target.checked ? checked : unchecked).value);
  };

  return (
    <label className="setting-checkbox">
      <input
        type="checkbox"
        name={name}
        checked={value === checked.value}
        disabled={disabled || definition.disabled}
        onChange={handleChange}
      />
      {t(definition.checkboxLabel ?? definition.label)}
    </label>
  );
};

/**
 * Slider through the options of a setting, in order.
 */
const SettingSlider = <Name extends SettingName>({ name, disabled }: { name: Name; disabled: boolean }) => {
  const { t } = useTranslation();
  const definition = SETTINGS_DEFINITIONS[name];
  const [value, setValue] = useSetting(name);
  const index = definition.options.findIndex((option) => option.value === value);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(definition.options[Number(event.target.value)].value);
  };

  return (
    <fieldset className="setting-slider" disabled={disabled || definition.disabled}>
      <legend>{t(definition.label)}</legend>
      <input
        type="range"
        min={0}
        max={definition.options.length - 1}
        step={1}
        value={index}
        aria-label={t(definition.label)}
        aria-valuetext={definition.options[index] && t(definition.options[index].label)}
        onChange={handleChange}
      />
    </fieldset>
  );
};

export default SettingsPanel;
