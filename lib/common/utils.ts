import assert from 'assert';
import { ClassConstructor, Transform } from 'class-transformer';
import { NumericRange } from './types';

export const sleep = async (ms: number) => {
  return await new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
};

export const wipeTimeout = (timeout: NodeJS.Timeout | undefined) => {
  if (timeout !== undefined) {
    clearTimeout(timeout);
    timeout = undefined;
  }
};

export const deepPartialCompare = <T>(a: Partial<T>, b: T): boolean => {
  for (const key in a) {
    // eslint-disable-next-line no-prototype-builtins
    if (a.hasOwnProperty(key)) {
      if (typeof a[key] === 'object' && a[key] !== undefined) {
        // Recursively compare nested objects
        if (!deepPartialCompare(a[key]!, b[key])) {
          return false;
        }
      } else if (a[key] !== b[key]) {
        // Compare non-object properties
        return false;
      }
    }
  }
  return true;
};

export const TransformBoolean = Transform(
  ({ value }) =>
    value === undefined || value === null
      ? undefined
      : ['1', 1, 'true', true, 'on'].includes(value),
  { toClassOnly: true },
);

export const isAsyncModuleOptions = <TOptions extends object>(
  options?: TOptions,
): boolean =>
  options !== undefined &&
  ('useFactory' in options ||
    'useValue' in options ||
    'useClass' in options ||
    'useExisting' in options ||
    'imports' in options);

export const isDefined = (value: unknown): asserts value => {
  assert(value !== undefined);
  assert(value !== null);
};

export function isInstance<T>(
  value: unknown,
  type: ClassConstructor<T>,
): value is T {
  return value instanceof type;
}

export function isTypeOf(
  value: unknown,
  typeString: 'boolean',
): value is boolean;
export function isTypeOf(value: unknown, typeString: 'number'): value is number;
export function isTypeOf(value: unknown, typeString: 'string'): value is string;
export function isTypeOf(value: unknown, typeString: 'bigint'): value is bigint;
export function isTypeOf(value: unknown, typeString: 'object'): value is object;
export function isTypeOf(
  value: unknown,
  typeString: 'undefined',
): value is undefined;
export function isTypeOf(value: unknown, typeString: string): boolean {
  return typeof value === typeString;
}

export function isBetween<Min extends number, Max extends number>(
  value: unknown,
  minimum: Min,
  maximum: Max,
): value is NumericRange<Min, Max> {
  if (isTypeOf(value, 'number')) {
    return value >= minimum && value <= maximum;
  }
  return false;
}
