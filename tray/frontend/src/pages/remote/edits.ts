/** The backspaces and the text that turn what the TV has into what the field now holds, sharing their common start. */
export function edits(before: string, after: string): { erase: number; type: string } {
  let common = 0;
  while (common < before.length && common < after.length && before[common] === after[common]) {
    common++;
  }

  return {
    erase: before.length - common,
    type: after.slice(common),
  };
}
