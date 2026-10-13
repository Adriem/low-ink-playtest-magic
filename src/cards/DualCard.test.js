import { render } from '@testing-library/react';
import DualCard from './DualCard';

// Faces render instantly in jsdom, so a fake card exposes its canvas and
// callbacks to control when each face finishes rendering
const faces = {};
const FakeCard = ({ cardName, canvasRef, onRendered }) => {
  const setCanvas = (canvas) => {
    if (canvasRef) canvasRef.current = canvas;
    faces[cardName] = { canvas, onRendered };
  };

  return <canvas ref={setCanvas} data-rendered="false" />;
};

const startRendering = (faceName) => {
  faces[faceName].canvas.dataset.rendered = 'false';
};

const finishRendering = (faceName) => {
  const { canvas, onRendered } = faces[faceName];
  canvas.dataset.rendered = 'true';
  onRendered(canvas);
};

// Let MutationObserver callbacks run
const flushObservers = () => Promise.resolve();

let ctx;
beforeEach(() => {
  ctx = {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    save: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    drawImage: jest.fn(),
    restore: jest.fn(),
  };
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx);
});

afterEach(() => jest.restoreAllMocks());

const setupDualCard = () => {
  const { container } = render(
    <DualCard Card={FakeCard} cardFaces={[{ name: 'Fire' }, { name: 'Ice' }]} cardSet="MH2" />,
  );
  // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
  return container.querySelector('canvas.card');
};

test('combines the faces once both have finished rendering', () => {
  const output = setupDualCard();

  finishRendering('Fire');
  expect(ctx.drawImage).not.toHaveBeenCalled();
  expect(output.dataset.rendered).toBe('false');

  finishRendering('Ice');
  expect(ctx.drawImage).toHaveBeenCalledTimes(2);
  expect(output.dataset.rendered).toBe('true');
});

test('is outdated while a face renders again, and combined again when it finishes', async () => {
  const output = setupDualCard();
  finishRendering('Fire');
  finishRendering('Ice');

  startRendering('Fire');
  await flushObservers();
  expect(output.dataset.rendered).toBe('false');

  finishRendering('Fire');
  expect(ctx.drawImage).toHaveBeenCalledTimes(4);
  expect(output.dataset.rendered).toBe('true');
});
