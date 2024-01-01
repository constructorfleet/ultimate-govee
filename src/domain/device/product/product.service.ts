import { Injectable } from '@nestjs/common';
import { ProductStore } from './product.store';
import { Product } from './product.model';
import { DeviceModel } from '../../models';

@Injectable()
export class ProductService {
  constructor(private readonly store: ProductStore) {}

  for(device: DeviceModel): Product | undefined {
    return this.store.get(device.model);
  }
}
