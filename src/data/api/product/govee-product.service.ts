import { Inject, Injectable, Logger } from '@nestjs/common';
import { GoveeProductConfig } from './govee-product.config';
import {
  SkuListResponse,
  Category,
  SkuGroup,
  SkuModel,
  Product as SkuProduct,
} from './models/sku-list.response';
import axios from 'axios';
import { ProductMap, Product } from './models/product-map';
import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class GoveeProductService {
  private readonly logger: Logger = new Logger(GoveeProductService.name);

  constructor(
    @Inject(GoveeProductConfig) private readonly config: GoveeProductConfig,
  ) {}

  async getProductCategories(): Promise<ProductMap> {
    try {
      const response = await axios.get<SkuListResponse>(this.config.skuListUrl);
      const productMap = this.parseResponse(response.data);
      if (!existsSync(this.config.storageDirectory)) {
        await mkdir(this.config.storageDirectory, { recursive: true });
      }
      await writeFile(
        join(this.config.storageDirectory, 'products.json'),
        JSON.stringify(productMap, null, 2),
        {
          encoding: 'utf-8',
        },
      );
      return productMap;
    } catch (error) {
      this.logger.error(`Error retrieving product list`, error);
      throw new Error(`Unable to retrieve product list`);
    }
  }

  private parseResponse(response: SkuListResponse): ProductMap {
    return response.categories.reduce(
      (productMap: ProductMap, category: Category): ProductMap => {
        category.supportGroups.forEach((group: SkuGroup) => {
          group.supportSkuList.forEach((model: SkuModel) => {
            model.products.forEach((product: SkuProduct) => {
              productMap[product.sku] = {
                category: category.name,
                group: group.groupName,
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
