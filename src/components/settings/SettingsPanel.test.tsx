import { fireEvent, render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import SettingsPanel from './SettingsPanel';
import { SettingsContextProvider, useCardPalette } from './SettingsContext';
import { overrideFlag } from '../../testUtils';
import { loadFromStorage, saveToStorage } from '../../utils/storage';

let user: UserEvent;

afterEach(() => localStorage.clear());

beforeEach(() => {
  user = userEvent.setup();
  // The slider, as in development (some tests turn it off)
  overrideFlag('ART_FIDELITY_SLIDER', true);
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

  await user.click(screen.getByLabelText('High'));

  expect(screen.getByLabelText('High')).toBeChecked();
  expect(getSavedSettings().inkLevel).toBe('high');
});

test('picks the art fidelity with a slider through its levels, with its flag on', () => {
  renderPanel();
  const slider = screen.getByRole('slider', { name: 'Art fidelity', hidden: true });

  expect(slider).toHaveValue('3');
  expect(slider).toHaveAttribute('aria-valuetext', '4');

  fireEvent.change(slider, { target: { value: '1' } });

  expect(slider).toHaveAttribute('aria-valuetext', '2');
  expect(getSavedSettings().artFidelity).toBe('contours');

  fireEvent.change(slider, { target: { value: '0' } });

  expect(getSavedSettings().artFidelity).toBe('blank');
  expect(screen.queryByLabelText('Include card art')).not.toBeInTheDocument();
});

describe('without the art fidelity slider', () => {
  beforeEach(() => {
    overrideFlag('ART_FIDELITY_SLIDER', false);
  });

  test('includes the card art or not, with a checkbox in its own group', async () => {
    renderPanel();
    const includeArt = screen.getByLabelText('Include card art');

    expect(screen.queryByRole('slider', { name: 'Art fidelity', hidden: true })).not.toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Card art', hidden: true })).toContainElement(includeArt);
    expect(includeArt).toBeChecked();

    await user.click(includeArt);

    expect(includeArt).not.toBeChecked();
    expect(getSavedSettings().includeArt).toBe('blank');
  });

  test('disables the card art for the minimalist style, which has no art', async () => {
    renderPanel();

    await user.click(screen.getByLabelText('Minimalist'));

    expect(screen.getByLabelText('Include card art')).toBeDisabled();
  });
});

test('disables the art fidelity for the minimalist style, which has no art', async () => {
  renderPanel();

  await user.click(screen.getByLabelText('Minimalist'));

  expect(screen.getByRole('slider', { name: 'Art fidelity', hidden: true })).toBeDisabled();

  await user.click(screen.getByLabelText('Realistic'));

  expect(screen.getByRole('slider', { name: 'Art fidelity', hidden: true })).toBeEnabled();
});

test('loads the saved settings, with the defaults for missing and unknown values', () => {
  saveToStorage('localStorage', 'press:SETTINGS@1', { cardVariant: 'minimalist', inkLevel: 'unknown' });

  renderPanel();

  expect(screen.getByLabelText('Minimalist')).toBeChecked();
  expect(screen.getByLabelText('Medium')).toBeChecked();
});

test('picks the border of the cards: none, a black outline or a full black border', async () => {
  renderPanel();

  expect(screen.getByRole('group', { name: 'Card border', hidden: true })).toBeInTheDocument();
  expect(screen.getByLabelText('Outline')).toBeChecked();

  await user.click(screen.getByLabelText('Full'));

  expect(screen.getByLabelText('Full')).toBeChecked();
  expect(getSavedSettings().cardBorder).toBe('full');
});

test('rounds the corners of the cards with a checkbox, in the card border group', async () => {
  renderPanel();
  const corners = screen.getByLabelText('Rounded corners');

  expect(screen.getByRole('group', { name: 'Card border', hidden: true })).toContainElement(corners);
  expect(corners).toBeChecked();

  await user.click(corners);

  expect(corners).not.toBeChecked();
  expect(getSavedSettings().cardCorners).toBe('square');
});

test('restores the default of every setting', async () => {
  saveToStorage('localStorage', 'press:SETTINGS@1', {
    cardVariant: 'minimalist',
    inkLevel: 'high',
    artFidelity: 'contours',
  });
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
    includeArt: 'no-filter',
    cardBorder: 'outline',
    cardCorners: 'rounded',
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
    expect(localStorage.getItem('press:PALETTE_REALISTIC')).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Save', hidden: true }));

    expect(drawnRed()).toBe('#ff0000');
    expect(loadFromStorage('localStorage', 'press:PALETTE_REALISTIC@1', {})).toMatchObject({ RED: '#ff0000' });
  });

  test('discards the changes not saved when the popup closes', async () => {
    await editRealisticPalette();
    fireEvent.input(redPicker(), { target: { value: '#ff0000' } });

    fireEvent(screen.getByRole('dialog', { hidden: true }), new Event('close'));

    expect(drawnRed()).toBe('default');
    expect(localStorage.getItem('press:PALETTE_REALISTIC')).toBeNull();
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

    expect(loadFromStorage('localStorage', 'press:PALETTE_REALISTIC@1', {})).toMatchObject({ RED: '#ff0000' });
    expect(localStorage.getItem('press:PALETTE_MINIMALIST')).toBeNull();
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
    expect(localStorage.getItem('press:PALETTE_REALISTIC')).toBeNull();
  });

  test('restores the default colors of a palette, to save them', async () => {
    saveToStorage('localStorage', 'press:PALETTE_REALISTIC@1', { RED: '#ff0000' });
    await editRealisticPalette();

    await user.click(screen.getByRole('button', { name: 'Restore defaults', hidden: true }));

    expect(redPicker().value).toBe('#d30e0e');
    expect(screen.getAllByTitle('Changed')).toHaveLength(1);
    expect(loadFromStorage('localStorage', 'press:PALETTE_REALISTIC@1', {})).toEqual({ RED: '#ff0000' });
  });
});

const getSavedSettings = () => {
  return loadFromStorage<Record<string, unknown>>('localStorage', 'press:SETTINGS@1', {});
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
