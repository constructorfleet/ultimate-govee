import {
  BitFlagEnum,
  BitFlagEnumValue,
  BitFlagValue,
  EnumValues,
  SingleEnumValue,
} from './types';

function orBitFlags<TValues extends readonly string[]>(
  this: BitFlagValue<TValues>,
  other: BitFlagValue<TValues>,
): BitFlagValue<TValues> {
  return new BitFlagValueImpl<TValues>(this.value | other.value);
}

function unionBitFlags<TValues extends readonly string[]>(
  this: BitFlagValue<TValues>,
  ...other: BitFlagValue<TValues>[]
): BitFlagValue<TValues> {
  let ret = this.value;
  for (let i = 0; i < other.length; i++) {
    const val = other[i];
    ret |= val.value;
  }
  return new BitFlagValueImpl(ret);
}

function hasBitFlag<TValues extends readonly string[]>(
  this: BitFlagValue<TValues>,
  other: BitFlagValue<TValues>,
): boolean {
  return (this.value & other.value) !== 0;
}

function intersectBitFlags<TValues extends readonly string[]>(
  this: BitFlagValue<TValues>,
  ...other: BitFlagValue<TValues>[]
): BitFlagValue<TValues> {
  let union = 0;
  for (let i = 0; i < other.length; i++) {
    const val = other[i];
    union |= val.value;
  }
  return new BitFlagValueImpl(this.value & union);
}

class BitFlagValueImpl<TValues extends readonly string[]>
  implements BitFlagValue<TValues>
{
  value: number;
  constructor(numberValue: number) {
    this.value = numberValue;
  }

  or = orBitFlags;
  union = unionBitFlags;
  hasFlag = hasBitFlag;
  intersect = intersectBitFlags;
}

class BitFlagEnumValueImpl<TValues extends readonly string[]>
  extends BitFlagValueImpl<TValues>
  implements BitFlagEnumValue<TValues>
{
  constructor(stringValue: SingleEnumValue<TValues>, numberValue: number) {
    super(numberValue);
    this.stringValue = stringValue;
  }
  stringValue: SingleEnumValue<TValues>;
}

class BitFlagEnumImpl<TArr extends readonly string[]> {
  readonly keys: readonly SingleEnumValue<TArr>[];

  constructor(values: TArr) {
    this.keys = values;

    for (let i = 0; i < values.length; i++) {
      const value = values[i] as SingleEnumValue<TArr>;

      const numValue = 1 << i;
      // @ts-expect-error this is valid for now... mostly. Would be ideal to
      // modify the return type to include the new 'number' values
      this[value] = new BitFlagEnumValueImpl<TArr>(value, numValue);
    }
  }

  union(other: BitFlagValue<TArr>[]): BitFlagValue<TArr> {
    let ret = 0;
    for (let i = 0; i < other.length; i++) {
      const val = other[i];
      ret |= val.value;
    }
    return new BitFlagValueImpl<TArr>(ret);
  }
}

export const createBitFlagsEnum = <TValues extends readonly string[]>(
  values: EnumValues<TValues>,
): BitFlagEnum<TValues> => {
  return new BitFlagEnumImpl(values) as BitFlagEnum<TValues>;
};
