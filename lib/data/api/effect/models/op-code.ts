import { Optional, base64ToHex, chunk, asOpCode } from '~ultimate-govee/common';

export const rebuildOpCode = (
  code?: number,
  opCodeBase64?: string,
): Optional<number[][]> => {
  if (opCodeBase64 === undefined || code === undefined) {
    return undefined;
  }
  const codes = base64ToHex(opCodeBase64);
  const lines = chunk([1, -1, 2, ...codes], 17);
  lines[0][1] = lines.length;
  return [
    ...lines.map((line: number[], index: number) =>
      asOpCode(163, index === lines.length - 1 ? 255 : index, ...line),
    ),
    asOpCode(51, 5, 4, code % 256, code >> 8),
  ];
};
