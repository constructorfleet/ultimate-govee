import { AggregateRoot } from '@nestjs/cqrs';
import {
  RefreshDeviceCommand,
  SetDeviceProductCommand,
} from '../cqrs/commands/device';
import { Product } from './product/product.model';

export class DeviceModel extends AggregateRoot {
  public category: string | undefined;
  public categoryId: number | undefined;
  public group: string | undefined;
  public groupId: number | undefined;
  public product?: Product | undefined;

  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly model: string,
    public readonly ic: number,
    public readonly pactType: number,
    public readonly pactCode: number,
    public readonly goodsType: number,
    public readonly softwareVersion: string,
    public readonly hardwareVersion: string,
    public readonly iotTopic?: string,
  ) {
    super();
    this.apply(new SetDeviceProductCommand(this.id));
  }

  refresh() {
    this.apply(new RefreshDeviceCommand(this.id, this.model));
  }
}
