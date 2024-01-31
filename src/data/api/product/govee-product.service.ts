import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { join } from 'path';
import { InjectPersisted, PersistResult } from '@govee/persist';
import { GoveeProductConfig } from './govee-product.config';
import { request } from '../../utils';
import {
  SkuListResponse,
  Category,
  SkuGroup,
  SkuModel,
  SkuProduct,
} from './models/sku-list.response';
import previousCategories from './assets/categories.json';
import { Product } from './models/product';

@Injectable()
export class GoveeProductService {
  private static readonly logger: Logger = new Logger(GoveeProductService.name);
  private readonly logger: Logger = new Logger(GoveeProductService.name);

  constructor(
    @Inject(GoveeProductConfig.KEY)
    private readonly config: ConfigType<typeof GoveeProductConfig>,
    @InjectPersisted({ filename: join('persisted', 'products.json') })
    private readonly persistedProducts: Record<string, Product>,
  ) {}

  @PersistResult({ path: 'persisted', filename: 'products.json' })
  async getProductCategories(): Promise<Record<string, Product>> {
    try {
      const productMap = GoveeProductService.parseResponse(
        await this.getApiReponse(),
      );
      const productMap2 = GoveeProductService.parseResponse(
        plainToInstance(SkuListResponse, previousCategories),
      );
      Object.entries(productMap2).forEach(([key, value]) => {
        productMap[key] = productMap[key] ?? value;
      });
      return productMap;
    } catch (error) {
      this.logger.error(`Error retrieving product list`, error);
      return this.persistedProducts;
    }
  }

  private async getApiReponse(): Promise<SkuListResponse> {
    const response = await request(this.config.skuListUrl, {
      accept: 'application/json',
    }).get(SkuListResponse);
    return response.data as SkuListResponse;
  }

  private static parseResponse(
    response: SkuListResponse,
  ): Record<string, Product> {
    const { categories } = response;
    return categories.reduce(
      (
        productMap: Record<string, Product>,
        category: Category,
      ): Record<string, Product> => {
        category.groups.forEach((group: SkuGroup) => {
          group.models.forEach((model: SkuModel) => {
            model.products.forEach((product: SkuProduct) => {
              productMap[product.model] = {
                category: category.name,
                categoryId: category.id,
                group: group.name,
                groupId: group.id,
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
      {} as Record<string, Product>,
    );
  }
}
