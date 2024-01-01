import { Injectable, OnModuleInit } from '@nestjs/common';
import { GoveeProductService } from '../../data';
import { ProductModel } from './products.model';

export type DeviceProduct = {
  get model(): string;
  set productData(product: ProductModel);
};

@Injectable()
export class ProductsService implements OnModuleInit {
  private readonly products: Record<string, Product> = {};
  constructor(private readonly api: GoveeProductService) {}

  for(device: DeviceProduct) {
    device.productData = this.products[device.model];
  }

  async onModuleInit() {
    const productMap = await this.api.getProductCategories();
    Object.values(productMap).forEach((product) => {
      this.products[product.modelName] = new ProductModel(
        product.category,
        product.group,
        product.modelName,
        product.ic,
        product.goodsType,
      );
    });
  }
}
