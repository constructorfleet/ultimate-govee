import { BehaviorSubject, Subject, auditTime, sampleTime } from 'rxjs';
import { Logger } from '@nestjs/common';
import { DeviceModel } from '../devices.model';
import { DeviceState } from '../states/device.state';
import { GoveeDeviceStatus } from '../../../../data';

export type DeviceStates = Record<string, DeviceState<string, any>>;
export type DeviceStateValues = Record<string, unknown>;

const deviceStateValues = (deviceStates: DeviceStates): DeviceStateValues =>
  Object.entries(deviceStates).reduce(
    (states: DeviceStateValues, [key, value]) => {
      states[key] = value.value;
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

export abstract class Device extends BehaviorSubject<DeviceStateValues> {
  private readonly logger: Logger = new Logger(this.constructor.name);
  private readonly refreshSubject: Subject<Date> = new Subject();

  static readonly deviceType: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static create(deviceMode: DeviceModel): Device | undefined {
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
    this.refreshSubject
      .pipe(sampleTime(5000))
      .subscribe(() => this.device.refresh());
    state.subscribe(() => {
      this.next(deviceStateValues(this.states));
    });
  }

  get id(): string {
    return this.device.id;
  }

  get model(): string {
    return this.device.model;
  }

  get name(): string {
    return this.device.name;
  }

  get goodsType(): number {
    return this.device.goodsType;
  }

  get iotTopic(): string | undefined {
    return this.device.iotTopic;
  }

  get currentState() {
    return Object.entries(this.states).reduce((s, [k, v]) => {
      s[k] = v.value;
      return s;
    }, {});
  }

  state<TDevice extends DeviceState<string, any> = DeviceState<string, any>>(
    stateName: string,
  ): TDevice | undefined {
    return this.states[stateName] as TDevice;
  }

  deviceStatus(status: GoveeDeviceStatus) {
    this.device.status.next(status);
  }

  refresh() {
    this.refreshSubject.next(new Date());
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
    device.status.subscribe((status) => {
      // this.logger.debug('Received status', status);
      Object.values(this.states).forEach((element) => {
        element.parse(status);
      });
      if ((status.cmd ?? 'status') !== 'status') {
        this.refresh();
      }
    });
    this.pipe(auditTime(5000)).subscribe((states) =>
      console.dir(
        {
          deviceId: this.id,
          name: this.name,
          model: this.model,
          type: this.constructor.name,
          ...states,
        },
        { depth: 4 },
      ),
    );
  }
}
