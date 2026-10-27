# Low-ink Playtest Magic

Print Magic: The Gathering™ playtest proxies that use as little ink as possible.

**[Open the app](https://playtest-magic.adriem.me/)**

Add the cards you want to try, one by one or as a whole deck list, and the app draws each one as a printable playtest card, with as much or as little ink as you choose. It lays them out 9 to a page, and exports them to a PDF to print, cut out and sleeve in front of a real card.

Low-ink Playtest Magic is unofficial fan-made software, for casual playtesting only: see [Legal](#legal).

## How to use it

1. **Add cards** by name in the search box. To add several at once, switch to **card list** and paste a list, one card per line. Lists from Arena, Moxfield, Archidekt, MTGO and MTGGoldfish work as they're copied:

   ```
   4 Lightning Bolt (STA) 42
   1 Sheoldred, the Apocalypse (DMU) 107 *F*
   SB: 2 Duress
   ```

   Quantities, sets, collector numbers, foil markers and the `SB:` prefix are understood. Section headers like `Sideboard` aren't cards: they're reported as not found, so remove them if you like.

2. **Arrange them:** hover a card (or tap it, or select it with the keyboard) to move it, delete it, or edit its art with an image of your own.
3. **Choose how they look** in **Settings**: the realistic or the minimalist style, how much ink to use, the card art, double-faced cards side by side or apart, borders and corners, and the colors of each style.
4. **Export** the cards to a PDF, in A4 or Letter. **Print it at actual size (100%)**, not "Fit to page", so the cards come out the size of real ones (63 × 88 mm).

Your cards stay while the tab is open, and your settings are kept for the next time.

## Privacy

The app has no server, no account, no analytics and no tracking. It runs in your browser, which talks to:

- [Scryfall](https://scryfall.com), to look up the cards you add by name (`api.scryfall.com`), and for their art (`cards.scryfall.io`) and mana symbols (`svgs.scryfall.io`). Like any website, Scryfall sees your IP address
- The sites of the images you add yourself with **Edit art**

Your card list (for as long as the tab is open), settings and palettes are saved in your browser's storage, and nowhere else.

## Legal

Low-ink Playtest Magic is unofficial fan-made software, not affiliated with, endorsed, sponsored or approved by Wizards of the Coast. Magic: The Gathering™, its card names, rules text, mana and set symbols, and card art are trademarks and copyrights of Wizards of the Coast LLC and of their artists.

The cards it makes are **playtest cards, for your personal, casual use only**: to try cards out before you own them. They aren't for sale, trade or distribution, and aren't legal in sanctioned tournaments. Every card says so, and credits its artist and Wizards of the Coast.

Card data and images come from [Scryfall](https://scryfall.com), following its [API guidelines](https://scryfall.com/docs/api): the app doesn't alter Scryfall's art, and doesn't imply Scryfall endorses it.

The images you add yourself with **Edit art** are yours to choose: you're responsible for having the right to use them, and to change them as the app does (e.g. filtering them), under their terms.

## Credits

- Card data, art and mana symbols: [Scryfall](https://scryfall.com).
- Icons: [Font Awesome Free](https://fontawesome.com) by Fonticons, Inc., licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) ([license](https://fontawesome.com/license/free)).
- Title font: [Cinzel](https://fonts.google.com/specimen/Cinzel) by Natanael Gama, licensed under the [SIL Open Font License 1.1](https://openfontlicense.org).
- Text font: [Inknut Antiqua](https://fonts.google.com/specimen/Inknut+Antiqua) by Claus Eggers Sørensen, licensed under the [SIL Open Font License 1.1](https://openfontlicense.org).

## License

The code is free software: © Adrian Moreno, licensed under the [GNU Affero General Public License v3](LICENSE) (AGPL-3.0-only). You can use, study, change and share it, as long as what you share (including a version you run as a website for others) stays under the same license, with its source available to its users.

The license covers the project's own code. The cards' names, text, symbols and art belong to Wizards of the Coast and their artists, card data and images come from Scryfall, and the icons and fonts have their own licenses (see [Credits](#credits)).

### Text and data mining

Apart from the license, and without adding any restriction to it, the author expressly reserves the right to use the project's content for text and data mining, including training artificial intelligence models, as Article 4(3) of [Directive (EU) 2019/790](https://eur-lex.europa.eu/eli/dir/2019/790/oj) allows. The site states it in a machine-readable way too (`tdm-reservation`, following the W3C's [TDMRep](https://www.w3.org/community/tdmrep/)).

## Supported browsers

Recent versions of Chrome, Edge, Firefox and Safari, on computers and phones.

## Contributing

Bugs and ideas are welcome as [issues](https://github.com/Adriem/low-ink-mtg-press/issues). Changes go through pull requests against `main`. [`AGENTS.md`](AGENTS.md) describes how the code is organized, and its conventions.

Use the Node version in `.nvmrc` (e.g. with `nvm use`), the one CI and deploys use, and install the dependencies with `npm ci`.

- `npm start`: run the app in development at [http://localhost:3000](http://localhost:3000). The card workbench, a development-only page, is at [/workbench](http://localhost:3000/workbench).
- `npm test`: run the tests with Vitest, in watch mode.
- `npm run lint`: lint the project with ESLint.
- `npm run format`: format the project with Prettier (`npm run format:check` checks it instead).
- `npm run typecheck`: type-check the project with TypeScript.
- `npm run build`: build the app for production into `dist`.
- `npm run preview`: serve the production build locally.

CI runs the lint, Prettier's check, the type check, the tests and the build on every pull request.
