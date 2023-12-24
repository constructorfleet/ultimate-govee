import { GoveeAPIResponse } from '../../govee-api.models';

export type SkuIC = {
  ic: number;
  sku: string;
};

export type SkuICResponseData = {
  skus: SkuIC[];
};

export type SkuICReponse = {
  data: SkuICResponseData;
} & GoveeAPIResponse;
