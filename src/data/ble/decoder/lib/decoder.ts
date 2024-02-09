import { chunk } from '../../../../common';
import {
  Comparator,
  DataSource,
  DecodeDevice,
  DecoderFn,
  DecoderArgs,
  Operations,
} from './types';
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
  Modulo,
  MultiplyBy,
  Substract,
  ValueFromHex,
} from './decoder.constants';

const reverseHexData = (hexData: string, length: number): string =>
  chunk(hexData.slice(0, length).split(''), 2)
    .reverse()
    .reduce((acc, value) => `${acc}${value.join('')}`, '');

const valueFromHexString = (
  hexData: string,
  offset: number,
  length: number,
  reverse?: boolean,
  canBeNegative?: boolean,
  isFloat?: boolean,
): number => {
  const hexValue = hexData.slice(offset, offset + length);
  const value = reverse === true ? reverseHexData(hexValue, length) : hexValue;
  const parsedValue =
    isFloat === true ? parseFloat(value) : parseInt(value, 16);

  if (canBeNegative === true) {
    if (length <= 2 && parsedValue > 128) {
      return parsedValue - 256;
    }
    if (length === 4 && parsedValue > 32767) {
      return parsedValue - 65536;
    }
  }
  return parsedValue;
};

const bcfValueFromHexString = (
  hexData: string,
  offset: number,
  length: number,
  reverse?: boolean,
  canBeNegative?: boolean,
  isFloat?: boolean,
): number => {
  const value = valueFromHexString(
    hexData,
    offset,
    length,
    reverse,
    canBeNegative,
    isFloat,
  );
  const dValue = ((value >> 8) * 100 + (value & 0xff)) / 100;
  return dValue;
};

export const evaluateComparison = (
  operator: Comparator,
  operand: number,
  operant: number,
): boolean => {
  switch (operator) {
    case Equals:
      return operand === operant;
    case GreaterThanEqual:
      return operand >= operant;
    case GreaterThan:
      return operand > operant;
    case LessThanEqual:
      return operand <= operant;
    case LessThan:
      return operand < operant;
    default:
      return false;
  }
};

const dataIndexIsValid = (
  data: string,
  index: number,
  length: number,
): boolean => data.length < index + length;

const dataLengthIsValid = (
  dataLength: number,
  defaultMin: number,
  conditions: Comparator[],
  index: number,
): { index: number; result: boolean } => {
  const op = conditions[index + 1];
  if (op?.length > 2) {
    return {
      index,
      result: dataLength >= defaultMin,
    };
  }
  const reqLength = Number.parseInt(conditions[index + 2], 10);
  if (reqLength === undefined) {
    return {
      index: index - 1,
      result: false,
    };
  }

  return {
    index: index + 2,
    result: evaluateComparison(op, dataLength, reqLength),
  };
};

export const postProcessing = (
  value: number,
  operations: Operations,
  calibration?: number,
): number | undefined => {
  if (operations.length === 0) {
    return value;
  }

  if (typeof operations[1] !== 'number' && operations[1] !== Calibration) {
    throw new Error(
      `Invalid post processing sequence, expected a number got ${operations[1]}`,
    );
  }
  const operant: number =
    (operations[1] === Calibration ? calibration : operations[1]) ?? 0;

  switch (operations[0]) {
    case GreaterThanEqual:
    case GreaterThan:
    case Equals:
    case LessThanEqual:
    case LessThan:
      return evaluateComparison(operations[0], value, operant)
        ? postProcessing(value, operations.slice(2), calibration)
        : undefined;
    case BitwiseOr:
      return postProcessing(value | operant, operations.slice(2), calibration);
    case BitwiseAnd:
      return postProcessing(value & operant, operations.slice(2), calibration);
    case MultiplyBy:
      return postProcessing(value * operant, operations.slice(2), calibration);
    case DivideBy:
      return postProcessing(value / operant, operations.slice(2), calibration);
    case Add:
      return postProcessing(value + operant, operations.slice(2), calibration);
    case Substract:
      return postProcessing(value - operant, operations.slice(2), calibration);
    case Modulo:
      return postProcessing(value % operant, operations.slice(2), calibration);
  }
};

export const Decoder = {
  value_from_hex_string: valueFromHexString,
  bf_value_from_hex_string: bcfValueFromHexString,
  decode(
    device: DecodeDevice,
    decoderArgs: DecoderArgs,
    postProcessingOperations?: Operations,
    calibation?: number,
  ): number | undefined {
    let decoder: DecoderFn;
    if (decoderArgs[0].includes('value_from_hex_data')) {
      if (decoderArgs[0].includes('bf')) {
        decoder = BCFValueFromHex;
      } else {
        decoder = ValueFromHex;
      }
    } else {
      decoder = decoderArgs[0];
    }
    const dataSource = decoderArgs[1] as DataSource;
    const args = [
      device[dataSource.replace('data', 'Data')],
      ...decoderArgs.slice(2),
    ] as Parameters<(typeof Decoder)[typeof decoder]>;
    const value = Decoder[decoder](
      args[0],
      args[1],
      args[2],
      args[3],
      args[4],
      args[5],
    );
    if (postProcessingOperations === undefined) {
      return value;
    }
    return postProcessing(value, postProcessingOperations, calibation);
  },
};
