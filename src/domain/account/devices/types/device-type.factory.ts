import { ClassConstructor } from 'class-transformer';
import { Subject } from 'rxjs';
import { DeviceModel } from '../devices.model';
import { DeviceType } from './device-type';

export type GroupMatcher = RegExp | RegExp[] | true;

export type GroupMatchers = Record<string, GroupMatcher>;
export type CategoryMatchers = Record<string, GroupMatchers>;

export type FactoryType = {
  create: (device: DeviceModel) => DeviceType | undefined;
};

export class DeviceTypeFactory<TDevice extends DeviceType> {
  private static factories: FactoryType[] = [];
  private static onNewDevice: Subject<DeviceType> = new Subject();
  static subscribe(
    ...args: Parameters<Subject<DeviceType>['subscribe']>
  ): ReturnType<Subject<DeviceType>['subscribe']> {
    return DeviceTypeFactory.onNewDevice.subscribe(...args);
  }

  constructor(
    private readonly typeConstructor: ClassConstructor<DeviceType>,
    private readonly matchers: CategoryMatchers,
  ) {
    DeviceTypeFactory.factories.push(this);
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
    DeviceTypeFactory.onNewDevice.next(newDevice);
    return newDevice;
  }
}
