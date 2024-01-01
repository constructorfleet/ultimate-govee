import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { SetDeviceProductCommand } from '../../cqrs';
import { ProductStore } from '../product/product.store';
import { DeviceStore } from '../device.store';

@CommandHandler(SetDeviceProductCommand)
export class DeviceProductHandler
  implements ICommandHandler<SetDeviceProductCommand>
{
  constructor(
    private readonly productService: ProductStore,
    private readonly deviceStore: DeviceStore,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(command: SetDeviceProductCommand) {
    const device = this.publisher.mergeObjectContext(
      this.deviceStore.get(command.deviceId),
    );
    const product = this.productService.get(device.model);
    if (!product) {
      return;
    }
    device.category = product.category;
    device.categoryId = product.categoryId;
    device.group = product.group;
    device.groupId = product.groupId;
    device.commit();
  }
}
