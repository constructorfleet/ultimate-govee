import { Injectable, OnModuleInit } from '@nestjs/common';
import { Product } from './product.model';
import { GoveeProductService } from '../../../data';

@Injectable()
export class ProductStore implements OnModuleInit {
  private readonly productMap: Record<string, Product> = {};

  constructor(private readonly api: GoveeProductService) {}

  set(model: string, product: Product): ProductStore {
    this.productMap[model] = product;
    return this;
  }

  get(model: string): Product | undefined {
    return this.productMap[model];
  }

  async onModuleInit() {
    const products = await this.api.getProductCategories();
    Object.values(products).forEach((product) =>
      this.set(product.modelName, product),
    );
  }
}
