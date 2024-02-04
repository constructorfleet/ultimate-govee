import { Labelled } from '@govee/common';
import { GoveeDevice, Product } from '@govee/data';

export class HandleDeviceConfigCommand implements Labelled {
  label = () =>
    `Handle ${this.product.category} Device ${this.device.id} Config`;
  constructor(
    readonly device: GoveeDevice,
    readonly product: Product,
  ) {}
}
