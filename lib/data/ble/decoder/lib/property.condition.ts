import {
  And,
  BitShift,
  Inverse,
  ManufacturerData,
  Or,
  ServiceData,
} from './decoder.constants';
import { Conditions, Comparator, DecodeDevice } from './types';
import { evaluateComparison } from './decoder';

export const propertyMatches = (
  device: DecodeDevice,
  conditions: Conditions,
  operand?: any,
): boolean => {
  if (conditions.length === 0) {
    return true;
  }
  if (conditions.includes(Or)) {
    return conditions
      .reduce(
        (acc, cond) => {
          if (cond === Or) {
            acc.push([]);
          } else {
            acc[acc.length - 1].push(cond);
          }
          return acc;
        },
        [[]] as Conditions[],
      )
      .some((conditionGroup) => {
        return propertyMatches(device, conditionGroup);
      });
  }
  // logger.debug({
  //   device,
  //   condition: conditions[0],
  //   condition1: conditions[1],
  //   operand,
  // });
  switch (conditions[0]) {
    case ManufacturerData:
    case ServiceData:
      if (typeof conditions[1] === 'number') {
        return propertyMatches(
          device,
          conditions.slice(2),
          Reflect.get(device, conditions[0].replace('data', 'Data')).slice(
            conditions[1] as number,
          ),
        );
      }
      if (
        typeof conditions[1] === 'string' &&
        Comparator.includes(conditions[1].replace('data', 'Data') as Comparator)
      ) {
        return (
          evaluateComparison(
            conditions[1] as Comparator,
            Reflect.get(device, conditions[0]).length,
            conditions[2] as number,
          ) && propertyMatches(device, conditions.slice(3))
        );
      }
      return false;
    case Inverse:
      return !propertyMatches(device, conditions.slice(1), operand);
    case BitShift:
      return (
        ((Number.parseInt(operand[0], 16) >> (conditions[1] as number)) &
          0x01) ===
          conditions[2] && propertyMatches(device, conditions.slice(3), device)
      );
    case And:
      return false;
    default:
      if (
        typeof conditions[0] === 'number' &&
        typeof conditions[1] === 'string' &&
        typeof operand === 'string'
      ) {
        return (
          conditions[1].slice(0, conditions[0]) ===
            operand.slice(0, conditions[0]) &&
          propertyMatches(device, conditions.slice(3))
        );
      }
      return false;
  }
};
