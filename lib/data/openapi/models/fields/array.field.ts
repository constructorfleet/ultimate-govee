import {
  Expose,
  Transform,
  Type,
  instanceToPlain,
  plainToInstance,
} from 'class-transformer';
import {
  DefaultOption,
  NameValueOption,
  EnumField,
  ParamIdOption,
} from './enum.field';
import { FieldDataType, Field, Parameter } from './field';
import { RangeOptions, IntegerField } from './integer.field';

export class ArraySize {
  @Expose({ name: 'min' })
  minItems!: number;

  @Expose({ name: 'max' })
  maxItems!: number;
}

export class Element<ElementType extends FieldDataType> {
  @Expose({ name: 'elementType' })
  elementType!: ElementType;
}

export class IntegerElement extends Element<FieldDataType.INTEGER> {
  @Expose({ name: 'elementRange' })
  @Type(() => RangeOptions)
  elementRange!: RangeOptions;
}

export class EnumElement extends Element<FieldDataType.ENUM> {
  @Expose({ name: 'elementOptions' })
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
  elementOptions!: (RangeOptions | NameValueOption | DefaultOption)[];
}

export class ArrayField extends Field<FieldDataType.ARRAY> {
  @Expose({ name: 'size' })
  @Type(() => ArraySize)
  size!: ArraySize;

  @Expose({ name: 'elementFields' })
  @Transform(({ value }) =>
    value.map((field: { dataType: FieldDataType }) => {
      switch (field.dataType) {
        case FieldDataType.INTEGER:
          return plainToInstance(IntegerField, field);
        case FieldDataType.ENUM:
          return plainToInstance(EnumField, field); // TODO
        case FieldDataType.ARRAY:
          return plainToInstance(ArrayField, field); // TODO
        // case FieldDataType.STRUCT:
        //   return plainToInstance(StructField, field); // TODO
        default:
          return field;
      }
    }),
  )
  elementFields?: Field<FieldDataType>[];

  @Expose({ name: 'elementOptions' })
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
  elementOptions?: (RangeOptions | NameValueOption | DefaultOption)[];

  @Expose({ name: 'elementRange' })
  @Type(() => RangeOptions)
  elementRange?: RangeOptions;
}

// export class StructElement extends Element<FieldDataType.STRUCT> {
//   @Expose({ name: 'elementFields' })
//   @Transform(({ value }) =>
//     value.map((field: { dataType: FieldDataType }) => {
//       switch (field.dataType) {
//         case FieldDataType.INTEGER:
//           return plainToInstance(IntegerField, field);
//         case FieldDataType.ENUM:
//           return plainToInstance(EnumField, field); // TODO
//         case FieldDataType.ARRAY:
//           return plainToInstance(ArrayField, field); // TODO
//         case FieldDataType.STRUCT:
//           return plainToInstance(StructField, field); // TODO
//         default:
//           return field;
//       }
//     }),
//   )
//   elementFields!: Field<FieldDataType>[];
// }

export class ArrayParameter extends Parameter<FieldDataType.ARRAY> {
  @Expose({ name: 'size' })
  @Type(() => ArraySize)
  size!: ArraySize;

  @Expose({ name: 'elementFields' })
  @Transform(({ value }) =>
    value.map((field: { dataType: FieldDataType }) => {
      switch (field.dataType) {
        case FieldDataType.INTEGER:
          return plainToInstance(IntegerField, field);
        case FieldDataType.ENUM:
          return plainToInstance(EnumField, field); // TODO
        case FieldDataType.ARRAY:
          return plainToInstance(ArrayField, field); // TODO
        // case FieldDataType.STRUCT:
        //   return plainToInstance(StructField, field); // TODO
        default:
          return field;
      }
    }),
  )
  elementFields?: Field<FieldDataType>[];

  @Expose({ name: 'elementOptions' })
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
  elementOptions?: (RangeOptions | NameValueOption | DefaultOption)[];

  @Expose({ name: 'elementRange' })
  @Type(() => RangeOptions)
  elementRange?: RangeOptions;
}
