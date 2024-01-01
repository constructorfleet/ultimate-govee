import { decode, encode } from 'base64-arraybuffer';

const ArrayRange = (count: number, start: number = 0): number[] =>
  Array(count).map((x, i) => i + start);

export const OpCode = {
  unpaddedHexToArray: (hexString?: string): number[] | undefined => {
    if (!hexString) {
      return undefined;
    }
    const padded = hexString
      ?.split(/(.{2})/g)
      ?.filter((i) => i.length > 0)
      ?.join(' ');
    const result = OpCode.hexStringToArray(padded);
    return result;
  },
  hexStringToArray: (hexString: string): number[] =>
    hexString
      .trim()
      .split(' ')
      .map((x) => parseInt(`0x${x}`, 10)),

  uint8ToHex: (uint8Array: Uint8Array): string =>
    Buffer.from(uint8Array)
      .toString('hex')
      .replace(/(.{2})/g, '$1 '),

  base64ToHexString: (b64String: string): string =>
    OpCode.uint8ToHex(new Uint8Array(decode(b64String))),

  base64ToHex: (b64String: string): number[] =>
    OpCode.hexStringToArray(
      OpCode.uint8ToHex(new Uint8Array(decode(b64String))),
    ),

  bufferToHex: (buffer: Buffer): number[] =>
    OpCode.hexStringToArray(OpCode.uint8ToHex(new Uint8Array(buffer))),

  hexToBase64: (codes: number[]): string => encode(Uint8Array.of(...codes)),

  total: (codes: number[], reverse: boolean = false) =>
    codes.reduce((res: number, code: number, index: number) => {
      if (reverse) {
        return 255 ** index * code + res;
      }
      return 255 ** (codes.length - index - 1) * code + res;
    }, 0),

  chunk: (codes: number[], chunkSize: number) =>
    ArrayRange(Math.ceil(codes.length / chunkSize)).map((i) =>
      codes.slice(i * chunkSize, i * chunkSize + chunkSize),
    ),
};
