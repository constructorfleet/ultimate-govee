import { Inject, Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigType } from '@nestjs/config';
import { GoveeProductConfig } from './govee-product.config';
import {
  SkuListResponse,
  Category,
  SkuGroup,
  SkuModel,
  Product as SkuProduct,
} from './models/sku-list.response';
import { ProductMap, Product } from '../../../domain/models/product-map';

@Injectable()
export class GoveeProductService {
  private readonly logger: Logger = new Logger(GoveeProductService.name);

  constructor(
    @Inject(GoveeProductConfig.KEY)
    private readonly config: ConfigType<typeof GoveeProductConfig>,
  ) {}

  async getProductCategories(): Promise<ProductMap> {
    try {
      const response = await axios.get<SkuListResponse>(this.config.skuListUrl);
      const productMap = GoveeProductService.parseResponse(response.data);
      return productMap;
    } catch (error) {
      this.logger.error(`Error retrieving product list`, error);
      throw new Error(`Unable to retrieve product list`);
    }
  }

  private static parseResponse(response: SkuListResponse): ProductMap {
    return response.categories.reduce(
      (productMap: ProductMap, category: Category): ProductMap => {
        category.supportGroups.forEach((group: SkuGroup) => {
          group.supportSkuList.forEach((model: SkuModel) => {
            model.products.forEach((product: SkuProduct) => {
              productMap[product.sku] = {
                category: category.name,
                categoryId: category.rootId,
                group: group.groupName,
                groupId: group.groupId,
                modelName: model.modelName,
                skuUrl: product.skuUrl,
                iconUrl: model.iconUrl,
                ic: product.ic,
                goodsType: product.goodsType,
              } as Product;
            });
          });
        });
        return productMap;
      },
      {} as ProductMap,
    );
  }
}
