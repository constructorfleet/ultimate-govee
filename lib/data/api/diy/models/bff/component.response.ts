import { Expose } from 'class-transformer';
export abstract class ComponentResponse {
  @Expose({ name: 'compnentId' })
  id!: number;

  @Expose({ name: 'name' })
  name!: string;

  @Expose({ name: 'type' })
  type!: number;

  @Expose({ name: 'canManage' })
  canManage?: boolean;

  @Expose({ name: 'canDisable' })
  canDisable?: boolean;
}
