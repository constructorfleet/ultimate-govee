import { Expose, Type } from 'class-transformer';
import { GoveeAPIResponse } from '../../govee-api.models';
import { Optional, base64ToHex } from '~ultimate-govee-common';

export class DIY {
  @Expose({ name: 'effectId' })
  effectId!: number;

  @Expose({ name: 'effectCode' })
  effectCode!: number[];

  @Expose({ name: 'effectStr' })
  diyOpCodeBase64!: string;

  @Expose({ name: 'diyEffect', toPlainOnly: true })
  get diyEffect(): Optional<number[]> {
    if (this.diyOpCodeBase64 === undefined) {
      return undefined;
    }
    // Probably wrong
    return base64ToHex(this.diyOpCodeBase64);
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

  @Expose({ name: 'name' })
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
