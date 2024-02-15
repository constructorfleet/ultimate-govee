import { Expose } from 'class-transformer';

export enum FieldDataType {
  INTEGER = 'INTEGER',
  ENUM = 'ENUM',
  ARRAY = 'Array',
  STRUCT = 'STRUCT',
}

export abstract class Parameter<DataType extends FieldDataType> {
  @Expose({ name: 'dataType' })
  dataType!: DataType;
}

export abstract class Field<
  DataType extends FieldDataType,
> extends Parameter<DataType> {
  @Expose({ name: 'fieldName' })
  name!: string;

  @Expose({ name: 'required' })
  isRequired!: boolean;
}
