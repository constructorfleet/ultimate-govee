import { ClassConstructor } from 'class-transformer';
import { Subject } from 'rxjs';
import { DeviceModel } from '../devices.model';
import { Device } from './device';

export type GroupMatcher = RegExp | RegExp[] | true;

export type GroupMatchers = Record<string, GroupMatcher>;
export type CategoryMatchers = Record<string, GroupMatchers>;

export type FactoryType = {
  create: (device: DeviceModel) => Device | undefined;
};

export class DeviceFactory<TDevice extends Device> {
  private static factories: FactoryType[] = [];
  private static onNewDevice: Subject<Device> = new Subject();
  static subscribe(
    ...args: Parameters<Subject<Device>['subscribe']>
  ): ReturnType<Subject<Device>['subscribe']> {
    return DeviceFactory.onNewDevice.subscribe(...args);
  }

  constructor(
    private readonly typeConstructor: ClassConstructor<Device>,
    private readonly matchers: CategoryMatchers,
  ) {
    DeviceFactory.factories.push(this);
  }

  create(device: DeviceModel): TDevice | undefined {
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
    const newDevice = new constructor(device) as TDevice;
    DeviceFactory.onNewDevice.next(newDevice);
    return newDevice;
  }
}
