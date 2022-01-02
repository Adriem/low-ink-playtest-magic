/**
 * Split an array into chunks of the given length.
 *
 * @param {*[]} array - Array to group into chunks
 * @param {number} size - Chunk size
 * @returns {*[]} Array of chunks of items from the original array
 */
export const chunk = (array, size) => {
  const source = [...array];
  const target = [];

  while (source.length) target.push(source.splice(0, size));

  return target;
};