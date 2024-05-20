import { unpack, DataType } from 'python-struct';

export const unpackLittle_hHB = (data: Buffer): DataType[] =>
  unpack('<hHB', data);

export const unpack_hHB = (data: Buffer): DataType[] => unpack('>hHB', data);
export const unpack_hh = (data: Buffer): DataType[] => unpack('>hh', data);
export const unpackLittle_hhhchhh = (data: Buffer): DataType[] =>
  unpack('<hhhchhh', data);
export const unpack_hhbhh = (data: Buffer): DataType[] =>
  unpack('>hhbhh', data);
export const unpack_hhhhh = (data: Buffer): DataType[] =>
  unpack('>hhhhh', data);
export const unpack_hhhhhh = (data: Buffer): DataType[] =>
  unpack('>hhhhhh', data);
