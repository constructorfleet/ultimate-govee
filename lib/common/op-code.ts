import { decode, encode } from 'base64-arraybuffer';
import { Optional } from './types';

export const ArrayRange = (count: number): number[] =>
  /* trunk-ignore(eslint/prefer-spread) */
  // eslint-disable-next-line prefer-spread
  Array.apply(null, Array(count)).map((_, i) => i);

export enum OpType {
  COMMAND = 0x33,
  REPORT = 0xaa,
}

export const hexStringToArray = (hexString: string): number[] =>
  hexString
    .trim()
    .split(' ')
    .map((x) => parseInt(`0x${x}`, 16));

export const uint8ToHex = (uint8Array: Uint8Array): string =>
  Buffer.from(uint8Array)
    .toString('hex')
    .replace(/(.{2})/g, '$1 ');

export const unpaddedHexToArray = (hexString?: string): Optional<number[]> => {
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
  (reverse ? codes.reverse() : codes).reduce(
    (res: number, code: number, index: number) =>
      res | (code << (8 * (codes.length - index - 1))),
    0,
  );

export const chunk = <T>(codes: T[], chunkSize: number) =>
  ArrayRange(Math.ceil(codes.length / chunkSize)).map((x, i) =>
    codes.slice(i * chunkSize, i * chunkSize + chunkSize),
  );

export const asOpCode = (opCode, ...values) => {
  const cmdFrame = Buffer.from([
    opCode,
    ...values.map((v) => (typeof v === 'number' ? [v] : v)).flat(),
  ]);
  const cmdPaddedFrame = Buffer.concat([
    cmdFrame,
    cmdFrame.length >= 19
      ? new Uint8Array([])
      : Buffer.from(new Array(19 - cmdFrame.length).fill(0)),
  ]);
  return Array.from(
    Buffer.concat([
      cmdPaddedFrame,
      Buffer.from([
        cmdPaddedFrame.reduce((checksum, val) => checksum ^ val, 0),
      ]),
    ]),
  );
};
