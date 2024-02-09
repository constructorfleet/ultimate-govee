import {
  Add,
  BCFValueFromHex,
  BitwiseAnd,
  BitwiseOr,
  Calibration,
  DivideBy,
  Equals,
  GreaterThan,
  GreaterThanEqual,
  LessThan,
  LessThanEqual,
  ManufacturerData,
  Modulo,
  MultiplyBy,
  ServiceData,
  Substract,
  ValueFromHex,
} from './decoder.constants';

export type DecodeService = {
  uuid: string;
  data: string;
};

export type DecodeDevice = {
  manufacturerData: string;
  name: string;
  uuid: string;
  serviceData: DecodeService[];
  macAddress: string;
};
export const Comparator = [
  Equals,
  GreaterThanEqual,
  GreaterThan,
  LessThanEqual,
  LessThan,
  '',
] as const;
export type Comparator = (typeof Comparator)[number];

export const Operator = [
  ...Comparator,
  BitwiseAnd,
  BitwiseOr,
  Modulo,
  MultiplyBy,
  DivideBy,
  Add,
  Substract,
  Calibration,
] as const;
export type Operator = (typeof Operator)[number];

export type Operation = Operator | number;
export type Operations = Operation[];

export type Condition = string | number;
export type Conditions = Condition[];
export const DecoderFn = [ValueFromHex, BCFValueFromHex] as const;
export type DecoderFn = (typeof DecoderFn)[number];
export const DataSource = [ManufacturerData, ServiceData] as const;
export type DataSource = (typeof DataSource)[number];
export type DecoderArgs = [
  DecoderFn,
  DataSource,
  number,
  number,
  boolean?,
  boolean?,
  boolean?,
];
