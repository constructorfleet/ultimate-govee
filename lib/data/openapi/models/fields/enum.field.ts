import {
  Expose,
  Transform,
  Type,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import { Field, FieldDataType, Parameter } from './field';
import { RangeOptions } from './integer.field';

export class NameValueOption {
  @Expose({ name: 'name' })
  name!: string;

  @Expose({ name: 'value' })
  value!: number;
}

export class ParamIdOption {
  @Expose({ name: 'id' })
  id!: number;

  @Expose({ name: 'paramId' })
  paramId!: number;
}

export class DefaultOption {
  @Expose({ name: 'name' })
  name!: string;

  @Expose({ name: 'defaultValue' })
  defaultValue!: number;
}

export class EnumOption {
  @Expose({ name: 'name' })
  name!: string;

  @Expose({ name: 'options' })
  @Transform(
    ({ value }) =>
      value.map((v) => {
        switch (true) {
          case v.defaultValue !== undefined:
            return plainToInstance(DefaultOption, v);
          case v.value !== undefined:
            return plainToInstance(NameValueOption, v);
          case v.range !== undefined:
            return plainToInstance(RangeOptions, v);
          case v.paramId !== undefined:
            return plainToInstance(ParamIdOption, v);
          default:
            return v;
        }
      }),
    {
      toClassOnly: true,
    },
  )
  @Transform(({ value }) => instanceToPlain(value), {
    toPlainOnly: true,
  })
  options!: (RangeOptions | NameValueOption | DefaultOption)[];
}

export class EnumField extends Field<FieldDataType.ENUM> {
  @Expose({ name: 'options' })
  @Transform(
    ({ value }) =>
      value.map((v) => {
        switch (true) {
          case v.defaultValue !== undefined:
            return plainToInstance(DefaultOption, v);
          case v.value !== undefined:
            return plainToInstance(NameValueOption, v);
          case v.range !== undefined:
            return plainToInstance(RangeOptions, v);
          case v.paramId !== undefined:
            return plainToInstance(ParamIdOption, v);
          default:
            return v;
        }
      }),
    {
      toClassOnly: true,
    },
  )
  @Transform(({ value }) => instanceToPlain(value), {
    toPlainOnly: true,
  })
  options!: (RangeOptions | NameValueOption | DefaultOption)[];
}

export class EnumParameter extends Parameter<FieldDataType.ENUM> {
  @Expose({ name: 'options' })
  @Type(() => NameValueOption)
  options!: NameValueOption[];
}
