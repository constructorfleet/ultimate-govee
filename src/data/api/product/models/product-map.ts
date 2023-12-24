import { Url } from 'url';

export type Product = {
  category: string;
  group: string;
  modelName: string;
  skuUrl?: string;
  iconUrl?: string;
  goodsType: number;
  ic: number;
};

export type ProductMap = {
  [sku: string]: unknown;
};
