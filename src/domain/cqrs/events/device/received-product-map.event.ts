import { ProductMap } from '../../../device/product/product.model';

export class ReceivedProductMapEvent {
  constructor(public readonly productMap: ProductMap) {}
}
