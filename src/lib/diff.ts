export type DiffKind = "same" | "added" | "removed";
export type DiffLine = { kind: DiffKind; text: string; oldLine?: number; newLine?: number };

export function diffLines(original: string, revised: string, maxLines = 250): DiffLine[] {
  const left = original.split("\n");
  const right = revised.split("\n");
  if (left.length > maxLines || right.length > maxLines) {
    throw new Error("This comparison exceeds " + maxLines + " lines per version. Compare a smaller selection.");
  }

  const rows = left.length + 1;
  const cols = right.length + 1;
  const table = Array.from({ length: rows }, () => new Uint16Array(cols));

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      table[i][j] = left[i] === right[j]
        ? table[i + 1][j + 1] + 1
        : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }

  const output: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      output.push({ kind: "same", text: left[i], oldLine: i + 1, newLine: j + 1 });
      i += 1;
      j += 1;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      output.push({ kind: "removed", text: left[i], oldLine: i + 1 });
      i += 1;
    } else {
      output.push({ kind: "added", text: right[j], newLine: j + 1 });
      j += 1;
    }
  }
  while (i < left.length) {
    output.push({ kind: "removed", text: left[i], oldLine: i + 1 });
    i += 1;
  }
  while (j < right.length) {
    output.push({ kind: "added", text: right[j], newLine: j + 1 });
    j += 1;
  }
  return output;
}
