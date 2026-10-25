import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ArtOverridePanel from './ArtOverridePanel';
import { loadImage } from '../cards/common/canvasRendering';
import { overrideArt, type Card } from '../../domain/cards';
import { testCard, testFace } from '../../testUtils';

vi.mock('../cards/common/canvasRendering', () => ({ loadImage: vi.fn() }));

// jsdom has no modal dialogs, so opening one only shows it, and closing it hides it and says so
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function () {
    this.open = false;
    this.dispatchEvent(new Event('close'));
  };
});

afterAll(() => {
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).showModal;
  delete (HTMLDialogElement.prototype as Partial<HTMLDialogElement>).close;
});

beforeEach(() => {
  vi.mocked(loadImage).mockResolvedValue(new Image());
});

const singleCard = testCard({ name: 'Colossal Dreadmaw' });
const splitCard = testCard({
  name: 'Fire // Ice',
  layout: 'split',
  mainFace: testFace({ name: 'Fire', art: { assetUrl: 'fire-ice.jpg', crop: { from: 0, to: 0.5 } } }),
  secondaryFace: testFace({ name: 'Ice', art: { assetUrl: 'fire-ice.jpg', crop: { from: 0.5, to: 1 } } }),
});

const renderPanel = (card: Card) => {
  const onPreview = vi.fn();
  const onSave = vi.fn();
  const onClose = vi.fn();
  render(<ArtOverridePanel card={card} onPreview={onPreview} onSave={onSave} onClose={onClose} />);
  return { onPreview, onSave, onClose };
};

test('overrides the art of a card with an image that loads, with its fidelity, and closes', async () => {
  const { onSave, onClose } = renderPanel(singleCard);

  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  await userEvent.type(screen.getByRole('textbox', { name: 'Image URL' }), 'https://example.com/art.png');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith(
      overrideArt(singleCard, { kind: 'unified', url: 'https://example.com/art.png' }, 'posterized'),
    ),
  );
  expect(onClose).toHaveBeenCalled();
});

test('overrides both faces of a split card with one image, by default', async () => {
  const { onSave } = renderPanel(splitCard);

  expect(screen.getByRole('radio', { name: 'Unified' })).toBeChecked();
  await userEvent.type(screen.getByRole('textbox', { name: 'Image URL' }), 'https://example.com/both.png');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith(
      overrideArt(splitCard, { kind: 'unified', url: 'https://example.com/both.png' }, 'posterized'),
    ),
  );
});

test('overrides each face with an image of its own', async () => {
  const { onSave } = renderPanel(splitCard);

  await userEvent.click(screen.getByRole('radio', { name: 'Split' }));
  await userEvent.type(screen.getByRole('textbox', { name: 'Image URL of Ice' }), 'https://example.com/ice.png');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith(
      overrideArt(splitCard, { kind: 'split', urls: ['', 'https://example.com/ice.png'] }, 'posterized'),
    ),
  );
});

test('previews the URLs once typing pauses, and the other changes right away, before saving them', () => {
  vi.useFakeTimers();
  try {
    const { onPreview, onSave } = renderPanel(singleCard);
    const withArt = expect.objectContaining({ mainFace: expect.objectContaining({ artOverride: expect.anything() }) });

    // Typed bit by bit, 100 ms apart
    ['https://e', 'https://example.com/a', 'https://example.com/art.png'].forEach((url) => {
      fireEvent.change(screen.getByRole('textbox', { name: 'Image URL' }), { target: { value: url } });
      act(() => vi.advanceTimersByTime(100));
    });

    // No partial URL was previewed while typing
    expect(onPreview).not.toHaveBeenCalledWith(withArt);

    act(() => vi.advanceTimersByTime(500));

    expect(onPreview).toHaveBeenLastCalledWith(
      overrideArt(singleCard, { kind: 'unified', url: 'https://example.com/art.png' }, 'posterized'),
    );

    fireEvent.change(screen.getByRole('slider', { name: 'Art fidelity' }), { target: { value: '1' } });

    expect(onPreview).toHaveBeenLastCalledWith(
      overrideArt(singleCard, { kind: 'unified', url: 'https://example.com/art.png' }, 'contours'),
    );
    expect(onSave).not.toHaveBeenCalled();
  } finally {
    vi.useRealTimers();
  }
});

test('enables the art fidelity only with an image URL', async () => {
  renderPanel(singleCard);
  const fidelity = screen.getByRole('slider', { name: 'Art fidelity' });

  expect(fidelity).toBeDisabled();

  await userEvent.type(screen.getByRole('textbox', { name: 'Image URL' }), 'https://example.com/art.png');

  expect(fidelity).toBeEnabled();

  await userEvent.clear(screen.getByRole('textbox', { name: 'Image URL' }));

  expect(fidelity).toBeDisabled();
});

test('credits the artist of the images, or an unknown one', async () => {
  const { onSave } = renderPanel(singleCard);
  const artist = screen.getByRole('textbox', { name: 'Artist' });

  expect(artist).toHaveAttribute('placeholder', 'Unknown');
  await userEvent.type(screen.getByRole('textbox', { name: 'Image URL' }), 'https://example.com/art.png');
  await userEvent.type(artist, 'Jane Doe');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));

  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith(
      overrideArt(singleCard, { kind: 'unified', url: 'https://example.com/art.png' }, 'posterized', 'Jane Doe'),
    ),
  );
});

test('starts from how the art was overridden', () => {
  const card = overrideArt(splitCard, { kind: 'split', urls: ['https://example.com/fire.png'] }, 'contours');
  renderPanel(card);

  expect(screen.getByRole('radio', { name: 'Split' })).toBeChecked();
  expect(screen.getByRole('textbox', { name: 'Image URL of Fire' })).toHaveValue('https://example.com/fire.png');
  expect(screen.getByRole('slider', { name: 'Art fidelity' })).toHaveAttribute('aria-valuetext', '2 (contours)');
  // An unknown artist shows as the placeholder
  expect(screen.getByRole('textbox', { name: 'Artist' })).toHaveValue('');
});

test('does not save images that do not load, saying why', async () => {
  vi.mocked(loadImage).mockRejectedValue(new Event('error'));
  const { onSave, onClose } = renderPanel(singleCard);

  await userEvent.type(screen.getByRole('textbox', { name: 'Image URL' }), 'https://example.com/missing.png');
  await userEvent.click(screen.getByRole('button', { name: 'Save' }));

  expect(await screen.findByRole('alert')).toHaveTextContent(/couldn't load an image/i);
  expect(onSave).not.toHaveBeenCalled();
  expect(onClose).not.toHaveBeenCalled();
});

test("clears the overrides, drawing the card's own art again", async () => {
  const card = overrideArt(splitCard, { kind: 'unified', url: 'https://example.com/both.png' }, 'contours');
  const { onSave, onClose } = renderPanel(card);

  await userEvent.click(screen.getByRole('button', { name: 'Clear' }));

  expect(onSave).toHaveBeenCalledWith(
    expect.objectContaining({
      mainFace: expect.objectContaining({ artOverride: undefined }),
      secondaryFace: expect.objectContaining({ artOverride: undefined }),
    }),
  );
  expect(onClose).toHaveBeenCalled();
});

test('cancels without saving', async () => {
  const { onSave, onClose } = renderPanel(singleCard);

  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));

  expect(onSave).not.toHaveBeenCalled();
  expect(onClose).toHaveBeenCalled();
});
