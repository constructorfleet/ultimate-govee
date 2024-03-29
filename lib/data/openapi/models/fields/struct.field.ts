import { Expose, Transform, plainToInstance } from 'class-transformer';
import { ArrayField } from './array.field';
import { EnumField } from './enum.field';
import { Field, FieldDataType, Parameter } from './field';
import { IntegerField } from './integer.field';

export class StructField extends Field<FieldDataType.STRUCT> {
  @Expose({ name: 'fields' })
  @Transform(({ value }) =>
    value.map((field: { dataType: FieldDataType }) => {
      switch (field.dataType) {
        case FieldDataType.INTEGER:
          return plainToInstance(IntegerField, field);
        case FieldDataType.ENUM:
          return plainToInstance(EnumField, field);
        case FieldDataType.ARRAY:
          return plainToInstance(ArrayField, field);
        case FieldDataType.STRUCT:
          return plainToInstance(StructField, field);
        default:
          return field;
      }
    }),
  )
  fields!: Field<FieldDataType>[];
}

export class StructParameter extends Parameter<FieldDataType.STRUCT> {
  @Expose({ name: 'fields' })
  @Transform(({ value }) =>
    value.map((field: { dataType: FieldDataType }) => {
      switch (field.dataType) {
        case FieldDataType.INTEGER:
          return plainToInstance(IntegerField, field);
        case FieldDataType.ENUM:
          return plainToInstance(EnumField, field);
        case FieldDataType.ARRAY:
          return plainToInstance(ArrayField, field);
        case FieldDataType.STRUCT:
          return plainToInstance(StructField, field);
        default:
          return field;
      }
    }),
  )
  fields!: Field<FieldDataType>[];
}
