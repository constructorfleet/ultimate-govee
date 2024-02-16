import { Expose, Transform, plainToInstance } from 'class-transformer';
import { Parameter, FieldDataType, Field } from './field';

export class RangeOptions {
  @Expose({ name: 'min' })
  minimum!: number;

  @Expose({ name: 'max' })
  maximum!: number;
}

export class PrecisionRangeOptions extends RangeOptions {
  @Expose({ name: 'precision' })
  precision!: number;
}

export class IntegerParameter<
  Range extends RangeOptions,
> extends Parameter<FieldDataType.INTEGER> {
  @Expose({ name: 'range' })
  @Transform(
    ({ value }) =>
      value.precision
        ? plainToInstance(PrecisionRangeOptions, value)
        : plainToInstance(RangeOptions, value),
    { toClassOnly: true },
  )
  range!: Range;

  @Expose({ name: 'unit' })
  unit?: string;
}

export class IntegerField<
  Range extends RangeOptions,
> extends Field<FieldDataType.INTEGER> {
  @Expose({ name: 'range' })
  @Transform(
    ({ value }) =>
      value.precision
        ? plainToInstance(PrecisionRangeOptions, value)
        : plainToInstance(RangeOptions, value),
    { toClassOnly: true },
  )
  range!: Range;

  @Expose({ name: 'unit' })
  unit?: string;
}
