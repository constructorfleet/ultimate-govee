import { Transform } from 'class-transformer';

export const sleep = async (ms: number) => {
  return await new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
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
