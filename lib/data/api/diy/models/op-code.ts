import {
  Optional,
  base64ToHex,
  chunk,
  asOpCode,
  OpType,
  Ignorable,
} from '~ultimate-govee-common';

export type DiyOpCodeBuilder = (
  identifier: Ignorable<Optional<number[]>>,
) => Optional<number[][]>;
export const rebuildDiyOpCode = (
  code?: number,
  opCodeBase64?: string,
): DiyOpCodeBuilder => {
  return (identifier: Ignorable<Optional<number[]>>): Optional<number[][]> => {
    if (opCodeBase64 === undefined || code === undefined) {
      return undefined;
    }
    const codes = base64ToHex(opCodeBase64);
    const lines = chunk([0x01, 0x02, 0x04, ...codes.splice(1)], 17);
    return [
      ...lines.map((line: number[], index: number) =>
        asOpCode(163, index === lines.length - 1 ? 255 : index, ...line),
      ),
      asOpCode(OpType.COMMAND, ...(identifier ?? []), code % 256, code >> 8),
      asOpCode(OpType.REPORT, ...([identifier?.at(0)] || []), 1),
    ];
  };
};
