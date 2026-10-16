/**
 * A symbol of Magic's text, wrapped in braces: mana (e.g. {2}, {W}, {U/P}),
 * tapping ({T}), energy ({E})…
 */
export type CardSymbol = `{${string}}`;

const SYMBOL_REGEX = /\{[^}]+\}/g;
const SYMBOL_RUN_REGEX = /(?:\{[^}]+\})+/g;

type TextChunk = { chunkType: 'text' | 'symbols'; value: string };

/**
 * Symbols in a text, in order, e.g. `['{2}', '{W}', '{U}']` for `{2}{W}{U}`.
 */
export const splitSymbols = (str: string): CardSymbol[] => {
  return (str.match(SYMBOL_REGEX) ?? []) as CardSymbol[];
};

/**
 * What a symbol stands for, without its braces, e.g. `T` for `{T}`, or `U/P`
 * for `{U/P}`.
 */
export const getSymbolValue = (sym: CardSymbol): string => {
  return sym.slice(1, -1);
};

/**
 * Split a text into runs of plain text and runs of symbols, in order, e.g.
 * `{T}: Add {G}.` is `{T}`, `: Add `, `{G}` and `.`.
 */
export const parseTextWithSymbols = (str: string): TextChunk[] => {
  const chunks: TextChunk[] = [];
  let textStart = 0;

  for (const match of str.matchAll(SYMBOL_RUN_REGEX)) {
    if (match.index > textStart) chunks.push({ chunkType: 'text', value: str.slice(textStart, match.index) });
    chunks.push({ chunkType: 'symbols', value: match[0] });
    textStart = match.index + match[0].length;
  }

  if (textStart < str.length) chunks.push({ chunkType: 'text', value: str.slice(textStart) });

  return chunks;
};
