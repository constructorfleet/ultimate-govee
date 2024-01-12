import { decode, encode } from 'base64-arraybuffer';

const ArrayRange = (count: number, start: number = 0): number[] =>
  Array(count).map((x, i) => i + start);

export const hexStringToArray = (hexString: string): number[] =>
  hexString
    .trim()
    .split(' ')
    .map((x) => parseInt(`0x${x}`, 16));

export const uint8ToHex = (uint8Array: Uint8Array): string =>
  Buffer.from(uint8Array)
    .toString('hex')
    .replace(/(.{2})/g, '$1 ');

export const unpaddedHexToArray = (
  hexString?: string,
): number[] | undefined => {
  if (!hexString) {
    return undefined;
  }
  const padded = hexString
    ?.split(/(.{2})/g)
    ?.filter((i) => i.length > 0)
    ?.join(' ');
  const result = hexStringToArray(padded);
  return result;
};

export const base64ToHexString = (b64String: string): string =>
  uint8ToHex(new Uint8Array(decode(b64String)));

export const base64ToHex = (b64String: string): number[] =>
  hexStringToArray(uint8ToHex(new Uint8Array(decode(b64String))));

export const bufferToHex = (buffer: Buffer): number[] =>
  hexStringToArray(uint8ToHex(new Uint8Array(buffer)));

export const hexToBase64 = (codes: number[]): string =>
  encode(Uint8Array.of(...codes));

export const total = (codes: number[], reverse: boolean = false) =>
  codes.reduce((res: number, code: number, index: number) => {
    if (reverse) {
      return 255 ** index * code + res;
    }
    return 255 ** (codes.length - index - 1) * code + res;
  }, 0);

export const chunk = (codes: number[], chunkSize: number) =>
  ArrayRange(Math.ceil(codes.length / chunkSize)).map((i) =>
    codes.slice(i * chunkSize, i * chunkSize + chunkSize),
  );
