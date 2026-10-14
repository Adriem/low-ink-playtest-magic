import type { Ref } from 'react';
import { SETTING_NAMES, SETTINGS_DEFINITIONS, useSetting, type SettingName } from './SettingsContext';

/**
 * Radio buttons to pick the value of a setting.
 */
const SettingFieldset = <Name extends SettingName>({ name }: { name: Name }) => {
  const definition = SETTINGS_DEFINITIONS[name];
  const [value, setValue] = useSetting(name);

  return (
    <fieldset disabled={definition.disabled}>
      <legend>{definition.label}</legend>
      {definition.options.map(option => (
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

const SettingsPanel = ({ ref }: { ref?: Ref<HTMLDialogElement> }) => (
  <dialog ref={ref}>
    <form method="dialog">
      {SETTING_NAMES.map(name => (
        <SettingFieldset key={name} name={name} />
      ))}
      <menu>
        <button type="submit">Close</button>
      </menu>
    </form>
  </dialog>
);

export default SettingsPanel;
