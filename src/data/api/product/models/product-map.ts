export type Product = {
  category: string;
  categoryId: number;
  group: string;
  groupId: number;
  modelName: string;
  skuUrl?: string;
  iconUrl?: string;
  goodsType: number;
  ic: number;
};

export type ProductMap = {
  [sku: string]: unknown;
};
