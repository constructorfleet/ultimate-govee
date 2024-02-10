import { Logger } from '@nestjs/common';
import { Conditions, DecodeDevice } from './types';
import {
  And,
  Index,
  Inverse,
  MacAtIndex,
  ManufacturerData,
  Name,
  NoManufacturerData,
  Or,
  ReverseMacAtIndex,
  ServiceData,
  UUID,
} from './decoder.constants';

const logger: Logger = new Logger('deviceMatches');

export const deviceMatches = (
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
      .some((conditionGroup) => deviceMatches(device, conditionGroup));
  }
  // logger.debug({
  //   device,
  //   condition: conditions[0],
  //   condition1: conditions[1],
  //   operand,
  // });
  switch (conditions[0]) {
    case ServiceData:
      return deviceMatches(device, conditions.slice(1), device.serviceData);
    case ManufacturerData:
      return deviceMatches(
        device,
        conditions.slice(1),
        device.manufacturerData,
      );
    case NoManufacturerData:
      return (
        device.manufacturerData.length === 0 &&
        deviceMatches(device, conditions.slice(1))
      );
    case Name:
      return deviceMatches(
        device,
        conditions.slice(1),
        (operand ?? device).name,
      );
    case UUID:
      return deviceMatches(
        device,
        conditions.slice(1),
        (operand ?? device).uuid,
      );
    case MacAtIndex:
      return deviceMatches(
        device,
        conditions.slice(2),
        device.macAddress[conditions[1]],
      );
    case ReverseMacAtIndex:
      return deviceMatches(
        device,
        conditions.slice(2),
        device.macAddress.split('').reverse().join('')[conditions[1]],
      );
    case And:
      return deviceMatches(device, conditions.slice(1));
    case Or:
      return true;
    case Inverse:
      return !deviceMatches(device, conditions.slice(1), operand);
    case Index:
      return deviceMatches(
        device,
        conditions.slice(2),
        operand.slice(
          typeof conditions[1] === 'string'
            ? Number.parseInt(conditions[1], 10)
            : conditions[1],
        ),
      );
    case '>=':
      return (
        (typeof operand === 'number' ? operand : operand.length) >=
          (conditions[1] as number) &&
        deviceMatches(device, conditions.slice(2), operand)
      );
    case '<=':
      return (
        (typeof operand === 'number' ? operand : operand.length) <=
          (conditions[1] as number) &&
        deviceMatches(device, conditions.slice(2), operand)
      );
    case '>':
      return (
        (typeof operand === 'number' ? operand : operand.length) >
          (conditions[1] as number) &&
        deviceMatches(device, conditions.slice(2), operand)
      );
    case '<':
      return (
        (typeof operand === 'number' ? operand : operand.length) <
          (conditions[1] as number) &&
        deviceMatches(device, conditions.slice(2), operand)
      );
    case '=':
      if (typeof conditions[1] === 'string') {
        return (
          operand.toString().startsWith(conditions[1]) &&
          deviceMatches(device, conditions.slice(2), operand)
        );
      }
      if (typeof operand === 'string') {
        return (
          operand.length === conditions[1] &&
          deviceMatches(device, conditions.slice(2), operand)
        );
      }
      return (
        conditions[1] === operand &&
        deviceMatches(device, conditions.slice(2), operand)
      );
    default:
      if (typeof conditions[0] === 'string') {
        return (
          operand.toString().startsWith(conditions[0]) &&
          deviceMatches(device, conditions.slice(1), operand)
        );
      }
      if (typeof operand === 'string') {
        return (
          operand.length === conditions[0] &&
          deviceMatches(device, conditions.slice(1), operand)
        );
      }
      return (
        conditions[0] === operand &&
        deviceMatches(device, conditions.slice(1), operand)
      );
      return false;
  }
};
