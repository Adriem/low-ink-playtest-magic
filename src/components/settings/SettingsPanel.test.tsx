import { fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import SettingsPanel from './SettingsPanel';
import { SettingsContextProvider, useCardPalette } from './SettingsContext';

let user: UserEvent;

afterEach(() => localStorage.clear());

beforeEach(() => {
  user = userEvent.setup();
});

test('shows a group of options for each setting, with the defaults selected', () => {
  renderPanel();

  expect(screen.getByRole('group', { name: 'Card style', hidden: true })).toBeInTheDocument();
  expect(screen.getByLabelText('Realistic')).toBeChecked();
  expect(screen.getByRole('group', { name: 'Double-Faced card treatment', hidden: true })).toBeInTheDocument();
  expect(screen.getByLabelText('Medium')).toBeChecked();
});

test('changes and saves a setting', async () => {
  renderPanel();

  await user.click(screen.getByLabelText('Minimalist'));

  expect(screen.getByLabelText('Minimalist')).toBeChecked();
  expect(getSavedSettings().cardVariant).toBe('minimalist');
});

test('picks the ink level', async () => {
  renderPanel();

  await user.click(screen.getByLabelText('High'));

  expect(screen.getByLabelText('High')).toBeChecked();
  expect(getSavedSettings().inkLevel).toBe('high');

  await user.click(screen.getByLabelText('Splurge'));

  expect(screen.getByLabelText('Splurge')).toBeChecked();
  expect(getSavedSettings().inkLevel).toBe('splurge');
});

test('picks the art fidelity with a slider through its levels', () => {
  renderPanel();
  const slider = screen.getByRole('slider', { name: 'Art fidelity', hidden: true });

  expect(slider).toHaveValue('3');
  expect(slider).toHaveAttribute('aria-valuetext', '4');

  fireEvent.change(slider, { target: { value: '1' } });

  expect(slider).toHaveAttribute('aria-valuetext', '2');
  expect(getSavedSettings().artFidelity).toBe('contours');

  fireEvent.change(slider, { target: { value: '0' } });

  expect(getSavedSettings().artFidelity).toBe('blank');
});

test('disables the art fidelity for the minimalist style, which has no art', async () => {
  renderPanel();

  await user.click(screen.getByLabelText('Minimalist'));

  expect(screen.getByRole('slider', { name: 'Art fidelity', hidden: true })).toBeDisabled();

  await user.click(screen.getByLabelText('Realistic'));

  expect(screen.getByRole('slider', { name: 'Art fidelity', hidden: true })).toBeEnabled();
});

test('loads the saved settings, with the defaults for missing and unknown values', () => {
  localStorage.setItem('press:settings', JSON.stringify({ cardVariant: 'minimalist', inkLevel: 'unknown' }));

  renderPanel();

  expect(screen.getByLabelText('Minimalist')).toBeChecked();
  expect(screen.getByLabelText('Medium')).toBeChecked();
});

test('restores the default of every setting', async () => {
  localStorage.setItem(
    'press:settings',
    JSON.stringify({ cardVariant: 'minimalist', inkLevel: 'splurge', artFidelity: 'contours' }),
  );
  renderPanel();

  await user.click(screen.getByRole('button', { name: 'Restore defaults', hidden: true }));

  expect(screen.getByLabelText('Realistic')).toBeChecked();
  expect(screen.getByLabelText('Medium')).toBeChecked();
  expect(screen.getByRole('slider', { name: 'Art fidelity', hidden: true })).toHaveAttribute('aria-valuetext', '4');
  expect(getSavedSettings()).toEqual({
    cardVariant: 'realistic',
    doubleFacedCardTreatment: 'separate',
    inkLevel: 'medium',
    artFidelity: 'posterized',
  });
});

describe('palettes', () => {
  const editRealisticPalette = async () => {
    renderPanel();
    await user.click(screen.getByRole('button', { name: 'Edit Realistic palette', hidden: true }));
  };
  const redPicker = () => screen.getByLabelText('Red') as HTMLInputElement;
  const drawnRed = () => screen.getByLabelText('Drawn red').textContent;

  test('draws the cards with the colors as they change, and saves them only with Save', async () => {
    await editRealisticPalette();

    fireEvent.input(redPicker(), { target: { value: '#ff0000' } });

    expect(drawnRed()).toBe('#ff0000');
    expect(localStorage.getItem('press:palette:realistic')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Save', hidden: true }));

    expect(drawnRed()).toBe('#ff0000');
    expect(JSON.parse(localStorage.getItem('press:palette:realistic') ?? '{}')).toMatchObject({ RED: '#ff0000' });
  });

  test('discards the changes not saved when the popup closes', async () => {
    await editRealisticPalette();
    fireEvent.input(redPicker(), { target: { value: '#ff0000' } });

    fireEvent(screen.getByRole('dialog', { hidden: true }), new Event('close'));

    expect(drawnRed()).toBe('default');
    expect(localStorage.getItem('press:palette:realistic')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Edit Realistic palette', hidden: true }));
    expect(redPicker().value).toBe('#d30e0e');
  });

  test('edits the palette of a card style instead of the settings', async () => {
    await editRealisticPalette();

    expect(screen.getByRole('group', { name: 'Realistic palette', hidden: true })).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Ink level', hidden: true })).not.toBeInTheDocument();
    expect(redPicker().value).toBe('#d30e0e');
  });

  test('saves the colors of each palette on its own, staying in its editor', async () => {
    await editRealisticPalette();

    fireEvent.input(redPicker(), { target: { value: '#ff0000' } });
    await user.click(screen.getByRole('button', { name: 'Save', hidden: true }));

    expect(JSON.parse(localStorage.getItem('press:palette:realistic') ?? '{}')).toMatchObject({ RED: '#ff0000' });
    expect(localStorage.getItem('press:palette:minimalist')).toBeNull();
    expect(screen.getByRole('group', { name: 'Realistic palette', hidden: true })).toBeInTheDocument();
    expect(redPicker().value).toBe('#ff0000');
    expect(screen.queryByTitle('Changed')).not.toBeInTheDocument();
  });

  test('marks the colors changed and not saved, and discards their changes', async () => {
    await editRealisticPalette();
    expect(screen.queryByTitle('Changed')).not.toBeInTheDocument();

    fireEvent.input(redPicker(), { target: { value: '#ff0000' } });

    expect(screen.getAllByTitle('Changed')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Discard changes', hidden: true }));

    expect(redPicker().value).toBe('#d30e0e');
    expect(screen.queryByTitle('Changed')).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Realistic palette', hidden: true })).toBeInTheDocument();
  });

  test('goes back to the settings without saving', async () => {
    await editRealisticPalette();

    fireEvent.input(redPicker(), { target: { value: '#ff0000' } });
    await user.click(screen.getByRole('button', { name: '← Back', hidden: true }));

    expect(screen.getByRole('group', { name: 'Ink level', hidden: true })).toBeInTheDocument();
    expect(localStorage.getItem('press:palette:realistic')).toBeNull();
  });

  test('restores the default colors of a palette, to save them', async () => {
    localStorage.setItem('press:palette:realistic', JSON.stringify({ RED: '#ff0000' }));
    await editRealisticPalette();

    await user.click(screen.getByRole('button', { name: 'Restore defaults', hidden: true }));

    expect(redPicker().value).toBe('#d30e0e');
    expect(screen.getAllByTitle('Changed')).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem('press:palette:realistic') ?? '{}')).toEqual({ RED: '#ff0000' });
  });
});

const getSavedSettings = () => {
  return JSON.parse(localStorage.getItem('press:settings') ?? '{}');
};

const renderPanel = () => {
  return render(
    <SettingsContextProvider>
      <SettingsPanel />
      <DrawnRed />
    </SettingsContextProvider>,
  );
};

// The red the realistic cards are drawn with, when it's a custom one
const DrawnRed = () => {
  return <output aria-label="Drawn red">{useCardPalette('realistic').RED ?? 'default'}</output>;
};
