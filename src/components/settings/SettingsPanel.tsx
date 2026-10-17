import type { ChangeEvent, Ref } from 'react';
import {
  SETTING_NAMES,
  SETTINGS_DEFINITIONS,
  isSettingAvailable,
  useSetting,
  type SettingName,
} from './SettingsContext';

import './SettingsPanel.css';

const SettingsPanel = ({ ref }: { ref?: Ref<HTMLDialogElement> }) => {
  const [cardStyle] = useSetting('cardVariant');

  return (
    <dialog ref={ref}>
      <form method="dialog">
        {SETTING_NAMES.map((name) => (
          // Settings that don't apply to the card style stay, disabled, so the panel keeps its size
          <SettingFieldset key={name} name={name} disabled={!isSettingAvailable(name, cardStyle)} />
        ))}
        <menu>
          <button type="submit">Close</button>
        </menu>
      </form>
    </dialog>
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
 * Slider through the options of a setting, in order, showing the one picked.
 */
const SettingSlider = <Name extends SettingName>({ name, disabled }: { name: Name; disabled: boolean }) => {
  const definition = SETTINGS_DEFINITIONS[name];
  const [value, setValue] = useSetting(name);
  const index = definition.options.findIndex((option) => option.value === value);
  const inputId = `setting-${name}`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(definition.options[Number(event.target.value)].value);
  };

  return (
    <fieldset className="setting-slider" disabled={disabled || definition.disabled}>
      <legend>{definition.label}</legend>
      <input
        id={inputId}
        type="range"
        min={0}
        max={definition.options.length - 1}
        step={1}
        value={index}
        aria-label={definition.label}
        aria-valuetext={definition.options[index]?.label}
        onChange={handleChange}
      />
      <output htmlFor={inputId}>{definition.options[index]?.label}</output>
    </fieldset>
  );
};

export default SettingsPanel;
