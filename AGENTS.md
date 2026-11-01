# Low-ink Playtest Magic

A web app that prints Magic: The Gathering™ playtest proxies using as little ink as possible. Users add cards by name (one at a time or as a list), the app draws each card on a `<canvas>`, lays them out in sheets of 9 (3×3), and exports them to a PDF. Card data and images come from Scryfall. It's a static site, served by Cloudflare Workers as static assets (`wrangler.jsonc`), with no server code.

## Commands

Use the Node version in `.nvmrc` (`nvm use`).

- `npm start`: development server. The card workbench, a development-only page for tuning renderers, is at `/workbench`.
- `npm run lint`, `npm run format:check` (`npm run format` to fix), `npm run typecheck`, `npx vitest run`, `npm run build`: what CI runs (`.github/workflows/ci.yml`), in that order. Run them all before pushing.
- Deploys: Cloudflare's Workers Builds builds `main` and deploys it (`npx wrangler deploy`), and deploys every other branch as a Preview, whose URL it posts on its pull request.
- Headers: `public/_headers` sets the site's headers, including a Content Security Policy that only lets the app load scripts, styles and fonts from itself (and Cloudflare Web Analytics) and send requests to Scryfall's API. A new host the app fetches from, or loads scripts or styles from, has to be added there, or browsers block it. Paths that don't exist get `public/404.html`.

## Stack

Vite, React 19, TypeScript, i18next with react-i18next, jsPDF. Tests: Vitest with jsdom and Testing Library. Lint: ESLint (flat config, with react, react-hooks, jsx-a11y and testing-library), formatting: Prettier.

## Layout

- `src/domain/`: the card model and pure logic, without React or the DOM: cards (`Card`, `CardFace`, art crops), card lists (`cardList.ts`, reading lists as deck builders export them), the press (sheets, items), colors, rules text, mana symbols.
- `src/adapters/`: the outside world. `scryfall/` fetches cards and symbols and converts Scryfall's cards to the domain's (`toCard`); `jspdf/` exports canvases to a PDF.
- `src/components/`:
  - `cards/`: the canvas renderers, in two styles, `realistic/` and `minimalist/`, with shared drawing code in `common/`. `Card` draws one face, `DualCard` two faces as one card (e.g. split cards).
  - `press/`: the page: search form, sheets, card overlays (move, delete…), actions bar, export.
  - `settings/`: settings (style, ink level, art fidelity, borders, palettes), in a context saved to local storage.
  - `popup/`: `Popup`, the modal used by every popup.
  - `icons/`: `Icon`, which draws a Font Awesome Free icon (e.g. `faTrash` from `@fortawesome/free-solid-svg-icons`) as an inline SVG.
  - `error/` (the app's error boundary), `header/`, `footer/`, `workbench/` (development only, left out of production builds).
- `src/hooks/`: the card collection, sheets, card lookups.
- `src/i18n/`: the texts (`en.json`) and the i18next setup.
- `src/styles/`: site-wide styles: the fonts (`fonts.css`) and the buttons and text fields (`controls.css`, with utility classes like `primary`, `danger`, `link-button`, `icon-button` and `floating`).
- `src/utils/`: small generic helpers (storage, arrays, objects, layout, a throttled queue).
- `src/testUtils.ts`: test helpers (`testCard`, `testFace`, `deferred`). Only tests may import it.

Keep the root of `src/` as clean as possible: new modules go in the folders above.

## Conventions

### Code

- Order code top-down: constants and types first, then public functions, each followed by its own private helpers; helpers shared by several functions go at the bottom.
- Named functions, including arrow functions assigned to a `const`, use braces and `return`. Concise arrow bodies are only for inline callbacks.
- Callback props are handled by functions named `handle` + the prop without `on`: `onClick={handleClick}`.
- Promises that are intentionally not awaited are prefixed with `void`.
- Don't store JSX in variables: write it inline, or extract a component.
- Use `useEffectEvent` for effect callbacks that need the latest props or state, and `useCallback` for handlers passed to children.
- Comments are short and say why, not what. JSDoc on exported functions and components, a line or two.

### UI

- Every text the user sees is in `src/i18n/en.json`, with snake_case keys. Components use `useTranslation`; code outside components (e.g. canvas renderers) uses `i18n.t`.
- Popups use `Popup` (a `<dialog>` opened with `showModal()`), rather than another dialog or its CSS. It takes the dialog's props and passes them down; `dismissible={false}` keeps clicks around it and Escape from closing it.
- Icons are `Icon`s, imported one by one so only the ones used are bundled. Don't load icon fonts or scripts.
- Styling is CSS only: if CSS can't do something, don't do it with JavaScript. Buttons are styled consistently (not left to the browser's defaults).
- Layouts work on phones: no horizontal page scroll; sheets scroll sideways on their own.

### Data

- Saved data goes through `src/utils/storage.ts` (`loadFromStorage`, `saveToStorage`), with keys prefixed `press:`. The card list is in session storage, settings and palettes in local storage. Keys are typed `StorageKey`, UPPER_CASE with the version of their data's shape (`press:SETTINGS@1`): bump a key's version when a change to its data's shape can't read what older releases saved (that data is then dropped). The version is saved with the data, not in the key, so old data is replaced rather than left behind. Storage may be unavailable, which the helpers handle.
- An error boundary around the app offers to reload, or to reset the saved data, instead of a blank page.
- Feature flags (`src/utils/flags.ts`, defined in `src/config.ts` as `Features`): UPPER_CASE names, each with a `Toggle` (`ON`, `OFF`, `ON_PROD_ONLY`, `ON_DEV_ONLY`). Read them from `window.flags`, or with `useFlag` in components, storing the value in a variable named `has` + the flag in camelCase (`const hasTermsDialog = useFlag('TERMS_DIALOG')`, `const hasTermsDialog = window.flags.TERMS_DIALOG`). They can be changed from the browser's console (`flags.SOME_FLAG = true`). Tests start with every flag off and use `overrideFlag` from `testUtils`.

### Tests

- Tests sit next to the code they test (`*.test.ts(x)`).
- jsdom has no modal dialogs or `IntersectionObserver`: `setupTests.ts` stands in for them. `showModal()` and `close()` only toggle a dialog's `open` attribute (which jsdom's styles show or hide it by) and fire `close`; nothing else modal (backdrop, focus, Escape) happens. Its `IntersectionObserver` never reports, and tests can replace it.
- Canvas rendering can't be checked in jsdom: check renderer changes visually, e.g. in the workbench or by rendering the cards in a browser.

## Scryfall

- The API is public, with no key, and is called from the browser: Scryfall rate-limits by IP, so each user has their own limit. Don't add a server in between.
- Card lookups are limited to 2 a second, and going over gets the client blocked for 30 seconds (HTTP 429). `adapters/scryfall/api.ts` takes care of it: a card added on its own is one request (`fetchCard`, `/cards/named`), a card list is one request per 75 cards (`fetchCollection`, `/cards/collection`), requests are 500 ms apart (a queue from `utils/throttledQueue.ts`), and 429s are retried next, once the block ends. Call Scryfall through it, never with `fetch` directly.
- Requests send `Accept: application/json`. Images (`cards.scryfall.io`) aren't rate-limited, and `loadImage` loads each one once.

## Legal constraints

These shape features, so check them before changing anything about art or cards:

- Scryfall's terms forbid distorting their images: no filters (desaturating, posterizing…) on Scryfall's art in production. Filters are for art users provide themselves (art overrides). The art fidelity slider is a development-only flag.
- Scryfall's terms require crediting the artist wherever art is shown: every card carries the artist, "™ & © Wizards of the Coast" and that it's a playtest card for personal use only, not for sale.
- Wizards of the Coast's Fan Content Policy doesn't cover proxies, so the app stays clearly unofficial and non-commercial: the site says it's not affiliated with Wizards, who own the cards' names, text, symbols and art, and in production users agree that the cards are for personal use only.
- The app is called "Low-ink Playtest Magic". Wherever we name the game, its full name carries the trademark sign: "Magic: The Gathering™".

## Git

- Branches are named `[type]/[short-kebab-title]`, with `type` one of `feat`, `fix`, `chore`, `doc`, `hotfix`.
- Changes go through pull requests against `main`. Rebase onto `main` rather than merging it in.
