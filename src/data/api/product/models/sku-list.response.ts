import { GoveeAPIResponse } from '../../govee-api.models';

export type PairUrl = {
  dark: string;
  light: string;
};

export type Product = {
  ic: number;
  pairUrl: PairUrl;
  sku: string;
  skuUrl: string;
  spec: string;
  extInfo: string;
  goodsType: number;
};

export type SkuModel = {
  hintContent: string;
  iconUrl: string;
  modelName: string;
  online: boolean;
  productId: number;
  showingSku: string;
  products: Product[];
};

export type SkuGroup = {
  groupId: number;
  groupName: string;
  supportSkuList: SkuModel[];
};

export type Category = {
  name: string;
  rootId: number;
  supportGroups: SkuGroup[];
};

export type SkuListResponse = {
  categories: Category[];
} & GoveeAPIResponse;
