/**
 * Split an array into chunks of the given length.
 *
 * @param array - Array to group into chunks
 * @param size - Chunk size
 * @returns Array of chunks of items from the original array
 */
export const chunk = <T>(array: readonly T[], size: number): T[][] => {
  const source = [...array];
  const target: T[][] = [];

  while (source.length) target.push(source.splice(0, size));

  return target;
};
