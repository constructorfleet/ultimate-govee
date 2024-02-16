import { Expose, Type } from 'class-transformer';
import { GoveeAPIResponse } from '../../govee-api.models';

export class SkuIC {
  @Expose({ name: 'ic' })
  ic!: number;

  @Expose({ name: 'sku' })
  model!: string;
}

export class SkuICResponseData {
  @Expose({ name: 'skus' })
  @Type(() => SkuIC)
  models!: SkuIC[];
}

export class SkuICReponse extends GoveeAPIResponse {
  @Expose({ name: 'data' })
  @Type(() => SkuICResponseData)
  data!: SkuICResponseData;
}
