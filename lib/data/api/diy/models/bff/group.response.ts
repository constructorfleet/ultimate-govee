import { Expose } from 'class-transformer';
import { TransformBoolean } from '../../../../common/utils';

export class GroupResponse {
  @Expose({ name: 'gId' })
  groupId: number;

  @Expose({ name: 'accountId' })
  accountId: number;

  @Expose({ name: 'name' })
  name?: string;

  @Expose({ name: 'type' })
  type: number;

  @Expose({ name: 'enable' })
  @TransformBoolean
  isEnabled: boolean;

  @Expose({ name: 'presetStatus' })
  presetStatus?: unknown;

  @Expose({ name: 'isBasedGroup' })
  @TransformBoolean
  isBasedGroup?: boolean;

  @Expose({ name: 'presetState' })
  presetState: number;

  @Expose({ name: 'presetId' })
  presetId: number;

  @Expose({ name: 'devices' })
  devices: object[];
}
