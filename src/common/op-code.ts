import { decode, encode } from 'base64-arraybuffer';

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
};
