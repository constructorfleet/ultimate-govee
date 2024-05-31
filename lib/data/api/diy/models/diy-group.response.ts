import { Exclude, Expose, Type } from 'class-transformer';
import { GoveeAPIResponse } from '../../govee-api.models';
import { DiyOpCodeBuilder, rebuildDiyOpCode } from './op-code';

export class DIY {
  @Expose({ name: 'effectId' })
  effectId!: number;

  @Expose({ name: 'effectCode' })
  effectCode!: number[];

  @Expose({ name: 'effectStr' })
  diyOpCodeBase64!: string;

  @Exclude()
  get opCode(): DiyOpCodeBuilder {
    return rebuildDiyOpCode(this.code, this.diyOpCodeBase64);
  }

  @Expose({ name: 'diyName' })
  name!: string;

  @Expose({ name: 'diyCode' })
  code!: number;

  @Expose({ name: 'effectType' })
  effectType!: number;
}

export class DIYGroup {
  @Expose({ name: 'groupId' })
  id!: number;

  @Expose({ name: 'groupName' })
  name!: string;

  @Expose({ name: 'diys' })
  @Type(() => DIY)
  diys!: DIY[];
}

export class DIYData {
  @Expose({ name: 'diys' })
  @Type(() => DIYGroup)
  diyGroups!: DIYGroup[];
}

export class DIYGroupResponse extends GoveeAPIResponse {
  @Expose({ name: 'data' })
  @Type(() => DIYData)
  diyData!: DIYData;
}
