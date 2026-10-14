import { SETTINGS_DEFINITIONS, useSetting } from './SettingsContext';

/**
 * Radio buttons to pick the value of a setting.
 *
 * @param {object} props
 * @param {string} props.name - Setting name
 * @param {import('./SettingsContext').SettingDefinition} props.definition
 */
const SettingFieldset = ({ name, definition }) => {
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

const SettingsPanel = ({ ref }) => (
  <dialog ref={ref}>
    <form method="dialog">
      {Object.entries(SETTINGS_DEFINITIONS).map(([name, definition]) => (
        <SettingFieldset key={name} name={name} definition={definition} />
      ))}
      <menu>
        <button type="submit">Close</button>
      </menu>
    </form>
  </dialog>
);

export default SettingsPanel;
