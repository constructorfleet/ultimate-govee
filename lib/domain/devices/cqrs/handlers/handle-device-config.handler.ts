import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { GoveeDevice, Product } from '@constructorfleet/ultimate-govee/data';
import { ClassConstructor } from 'class-transformer';
import { Logger } from '@nestjs/common';
import { HandleDeviceConfigCommand } from '../commands';
import {
  BLEDevice,
  DeviceModel,
  IoTDevice,
  WiFiDevice,
} from '../../devices.model';
import { Version } from '../../version.info';
import { DevicesFactory } from '../../devices.factory';
import { DevicesService } from '../../devices.service';
import { DeviceStatusReceivedEvent } from '../events';
import { of } from 'rxjs';

@CommandHandler(HandleDeviceConfigCommand)
export class HandleDeviceConfigCommandHandler
  implements ICommandHandler<HandleDeviceConfigCommand>
{
  private readonly logger: Logger = new Logger(
    HandleDeviceConfigCommandHandler.name,
  );

  constructor(
    private readonly eventBus: EventBus,
    private readonly service: DevicesService,
    private readonly factory: DevicesFactory,
  ) {}

  async execute(command: HandleDeviceConfigCommand): Promise<any> {
    this.logger.log(
      `Handling device config for ${command.device.name} ${command.product.modelName}`,
    );

    let device = this.service.getDevice(command.device.id);

    if (!this.service.getDevice(command.device.id)) {
      device = this.service.setDevice(
        this.factory.create(
          this.createDeviceModel(command.device, command.product),
        ),
      );
    }

    this.eventBus.publish(new DeviceStatusReceivedEvent(command.device));
  }

  createDeviceModel(device: GoveeDevice, product?: Product): DeviceModel {
    let constructor: ClassConstructor<DeviceModel> = DeviceModel;
    if (device.blueTooth) {
      constructor = BLEDevice(constructor);
    }
    if (device.wifi) {
      constructor = WiFiDevice(constructor);
    }
    if (device.iotTopic) {
      new Logger('createDevice').debug(device.iotTopic);
      constructor = IoTDevice(constructor);
    }
    const newDevice = new constructor({
      ...device,
      version: new Version(device.hardwareVersion, device.softwareVersion),
      category: product?.category || 'unknown',
      categoryGroup: product?.group || 'unknown',
      modelName: product?.modelName || 'unknown',
    });
    // newDevice.refreshers.push(...refreshers);
    return newDevice;
  }
}
