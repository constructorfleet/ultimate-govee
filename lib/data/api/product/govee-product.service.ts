import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import {
  InjectPersisted,
  PersistModule,
  PersistResult,
} from '~ultimate-govee-persist';
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
import { join } from 'path';
import AsyncLock from 'semaphore-async-await';
import MomentLib from 'moment';

@Injectable()
export class GoveeProductService {
  private readonly logger: Logger = new Logger(GoveeProductService.name);
  private readonly lock: AsyncLock = new AsyncLock(1);
  private lastUpdate: MomentLib.Moment | undefined = undefined;
  private static previousProductMap = GoveeProductService.parseResponse(
    plainToInstance(SkuListResponse, previousCategories ?? {}),
  );

  constructor(
    @Inject(GoveeProductConfig.KEY)
    private readonly config: ConfigType<typeof GoveeProductConfig>,
    @InjectPersisted({ filename: 'govee.products.json' })
    private readonly persistedProducts: Record<string, Product>,
  ) {
    if (persistedProducts === undefined) {
      persistedProducts = {};
    }
    Object.entries(GoveeProductService.previousProductMap).forEach(
      ([key, value]) => {
        persistedProducts[key] = persistedProducts[key] ?? value;
      },
    );
    GoveeProductService.previousProductMap = persistedProducts;
  }

  @PersistResult({ filename: 'govee.products.json' })
  async getProductCategories(): Promise<Record<string, Product>> {
    await this.lock.acquire();
    this.logger.log(
      `Last Update: ${this.lastUpdate} isAfter? ${this.lastUpdate !== undefined ? this.lastUpdate.add(1, 'hour').isAfter(MomentLib()) : 'false'}`,
    );
    try {
      if (
        this.lastUpdate !== undefined &&
        this.lastUpdate.add(1, 'hour').isAfter(MomentLib())
      ) {
        this.logger.log('Updated within last hour, using previous result.');
        return GoveeProductService.previousProductMap;
      }
      this.logger.log('Retrieving product list from Govee REST API');
      const productMap = GoveeProductService.parseResponse(
        await this.getApiReponse(),
      );
      Object.entries(GoveeProductService.previousProductMap).forEach(
        ([key, value]) => {
          productMap[key] = productMap[key] ?? value;
        },
      );
      GoveeProductService.previousProductMap = productMap;
      this.lastUpdate = MomentLib();
      return productMap;
    } catch (error) {
      this.logger.error('Error retrieving product list', error);
      return GoveeProductService.previousProductMap;
    } finally {
      this.lock.release();
    }
  }

  private async getApiReponse(): Promise<SkuListResponse> {
    const response = await request(this.config.skuListUrl, {
      accept: 'application/json',
    }).get(
      SkuListResponse,
      join(PersistModule.persistRootDirectory, 'govee.products.raw.json'),
    );
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
