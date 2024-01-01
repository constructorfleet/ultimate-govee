import { BehaviorSubject } from 'rxjs';
import { DeviceModel } from '../devices.model';
import { DeviceState } from '../states/device.state';

export type DeviceStates = Record<string, DeviceState<string, any>>;
export type DeviceStateValues = Record<string, unknown>;

const deviceStateValues = (deviceStates: DeviceStates): DeviceStateValues =>
  Object.entries(deviceStates).reduce(
    (states: DeviceStateValues, [key, value]) => {
      states[key] = value;
      return states;
    },
    {} as DeviceStateValues,
  );

export const DefaultFactory: 'default' = 'default' as const;

export type StateFactory<TDevice extends DeviceState<string, unknown>> = (
  device: DeviceModel,
) => TDevice;

type ModelStateFactoryValue =
  | StateFactory<DeviceState<string, any>>
  | StateFactory<DeviceState<string, any>>[];

export type ModelStateFactory =
  | Record<string, ModelStateFactoryValue>
  | StateFactory<DeviceState<string, any>>;

export type StateFactories = ModelStateFactory[];

export abstract class DeviceType extends BehaviorSubject<DeviceStateValues> {
  static readonly deviceType: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static create(device: DeviceModel): DeviceType | undefined {
    return undefined;
  }

  private readonly deviceStates: BehaviorSubject<DeviceStates> =
    new BehaviorSubject({});
  private readonly states: DeviceStates = {};

  protected addState<TDevice extends DeviceState<string, any>>(
    state: TDevice,
  ): void {
    this.states[state.name] = state;
    this.deviceStates.next(this.states);
    state.subscribe(() => this.next(deviceStateValues(this.states)));
  }

  state<TDevice extends DeviceState<string, any> = DeviceState<string, any>>(
    stateName: string,
  ): TDevice | undefined {
    return this.states[stateName] as TDevice;
  }

  constructor(
    protected readonly device: DeviceModel,
    stateFactories: StateFactories,
  ) {
    super({});
    stateFactories
      .map((factory) =>
        typeof factory === 'object'
          ? factory[device.model] ?? factory[DefaultFactory]
          : factory,
      )
      .filter((factory) => factory !== undefined)
      .map((factory) =>
        Array.isArray(factory)
          ? factory.map((f) => f(device))
          : factory(device),
      )
      .flat()
      .forEach((state) => this.addState(state));
  }
}
