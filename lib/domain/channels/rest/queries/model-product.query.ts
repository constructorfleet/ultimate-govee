import { Labelled } from '@constructorfleet/ultimate-govee/common';
import { GoveeDevice } from '@constructorfleet/ultimate-govee/data';
import { Logger } from '@nestjs/common';

export class ModelProductQuery implements Labelled {
  label = () => `Product Info For ${this.device.model}`;

  private readonly logger = new Logger(ModelProductQuery.name);
  constructor(readonly device: GoveeDevice) {
    this.logger.log(`${this.device.model}`);
  }
}
