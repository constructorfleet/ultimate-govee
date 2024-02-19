import { ClassConstructor } from 'class-transformer';
import { Optional } from '~ultimate-govee-common';
import { CommandBus, EventBus } from '@nestjs/cqrs';
import { DeviceModel } from './devices.model';
import { Device } from './device';

export type GroupMatcher = RegExp | RegExp[] | true;

export type GroupMatchers = Record<string, GroupMatcher>;
export type CategoryMatchers = Record<string, GroupMatchers>;

export type FactoryType = {
  create: (
    device: DeviceModel,
    eventaBus: EventBus,
    commandBus: CommandBus,
  ) => Optional<Device>;
};

export class DeviceFactory<TDevice extends Device> {
  private static factories: FactoryType[] = [];

  constructor(
    private readonly typeConstructor: ClassConstructor<Device>,
    private readonly matchers: CategoryMatchers,
  ) {
    DeviceFactory.factories.push(this);
  }

  create(
    device: DeviceModel,
    eventBus: EventBus,
    commandBus: CommandBus,
  ): Optional<TDevice> {
    const categoryMatches = this.matchers[device.category];
    if (categoryMatches === undefined) {
      return undefined;
    }
    const groupMatches = categoryMatches[device.categoryGroup];
    if (groupMatches === undefined) {
      return undefined;
    }
    if (typeof groupMatches !== 'boolean') {
      const patternMatches = (
        Array.isArray(groupMatches) ? groupMatches : [groupMatches]
      ).find((pattern) => device.modelName.match(pattern));
      if (patternMatches === undefined) {
        return undefined;
      }
    }
    const constructor = this.typeConstructor;
    const newDevice = new constructor(device, eventBus, commandBus) as TDevice;
    return newDevice;
  }
}
