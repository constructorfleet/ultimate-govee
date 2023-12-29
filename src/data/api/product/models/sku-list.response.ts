import { Expose, Type } from 'class-transformer';
import { GoveeAPIResponse } from '../../govee-api.models';

export class PairUrl {
  @Expose({ name: 'dark' })
  dark?: string;

  @Expose({ name: 'light' })
  light?: string;
}

export class SkuProduct {
  @Expose({ name: 'ic' })
  ic!: number;

  @Expose({ name: 'pairUrl' })
  pairUrl?: PairUrl;

  @Expose({ name: 'sku' })
  model!: string;

  @Expose({ name: 'skuUrl' })
  skuUrl?: string;

  @Expose({ name: 'spec' })
  spec?: string;

  @Expose({ name: 'extInfo' })
  extInfo?: string;

  @Expose({ name: 'goodsType' })
  goodsType!: number;
}

export class SkuModel {
  @Expose({ name: 'hintContent' })
  hintContent?: string;

  @Expose({ name: 'iconUrl' })
  iconUrl?: string;

  @Expose({ name: 'modelName' })
  modelName!: string;

  @Expose({ name: 'online' })
  online!: boolean;

  @Expose({ name: 'productId' })
  productId!: number;

  @Expose({ name: 'showingSKu' })
  showingSku!: string;

  @Expose({ name: 'products' })
  @Type(() => SkuProduct)
  products!: SkuProduct[];
}

export class SkuGroup {
  @Expose({ name: 'groupId' })
  id!: number;

  @Expose({ name: 'groupName' })
  name!: string;

  @Expose({ name: 'supportSkuList' })
  @Type(() => SkuModel)
  models!: SkuModel[];
}

export class Category {
  @Expose({ name: 'name' })
  name!: string;

  @Expose({ name: 'rootId' })
  id!: number;

  @Expose({ name: 'supportGroups' })
  @Type(() => SkuGroup)
  groups!: SkuGroup[];
}

export class SkuListResponse extends GoveeAPIResponse {
  @Expose({ name: 'categories' })
  categories!: Category[];
}
