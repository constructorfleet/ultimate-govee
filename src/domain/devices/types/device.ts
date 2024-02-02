import { BehaviorSubject, interval } from 'rxjs';
import { Logger } from '@nestjs/common';
import { Optional } from '@govee/common';
import { GoveeDeviceStatus } from '@govee/data';
import { DeviceModel } from '../devices.model';
import { DeviceState } from '../states/device.state';
import Winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const getLogger = (device: Device): Winston.Logger =>
  Winston.createLogger({
    level: 'info',
    format: Winston.format.combine(
      Winston.format.timestamp(),
      Winston.format.json({
        space: 2,
      }),
    ),
    transports: [
      new DailyRotateFile({
        dirname: `persisted/devices/${device.model}`,
        filename: `${device.id.replace(/:/g, '')}-%DATE%.log`,
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '7d',
      }),
    ],
  });

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

const buildStates = (
  stateFactories: StateFactories,
  device: DeviceModel,
): DeviceState<string, any>[] =>
  stateFactories
    .map((factory) =>
      typeof factory === 'object'
        ? factory[device.model] ?? factory[DefaultFactory]
        : factory,
    )
    .filter((factory) => factory !== undefined)
    .map((factory) =>
      Array.isArray(factory) ? factory.map((f) => f(device)) : factory(device),
    )
    .flat();

export abstract class Device extends BehaviorSubject<DeviceStateValues> {
  private readonly logger: Logger = new Logger(this.constructor.name);
  // private readonly refreshSubject: Subject<Date> = new Subject();

  static readonly deviceType: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static create(deviceMode: DeviceModel): Optional<Device> {
    return undefined;
  }

  private readonly states: DeviceStates = {};

  protected addState<TDevice extends DeviceState<string, any>>(
    state: TDevice,
  ): void {
    this.states[state.name] = state;
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

  get iotTopic(): Optional<string> {
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
  ): Optional<TDevice> {
    return this.states[stateName] as TDevice;
  }

  deviceStatus(status: GoveeDeviceStatus) {
    this.device.status.next(status);
  }

  refresh() {
    this.device.refresh();
  }

  setState(stateName: string, nextState: any): any {
    return this.state(stateName)?.setState(nextState);
  }

  protected stateLogger: Winston.Logger | undefined;

  constructor(
    protected readonly device: DeviceModel,
    stateFactories: StateFactories,
  ) {
    super({});
    buildStates(stateFactories, device).forEach((state) => {
      this.addState(state);
      state.parse({
        cmd: 'status',
        ...device.status.value,
      });
    });
    device.status.subscribe((status) => {
      Object.values(this.states).forEach((element) => {
        element.parse(status);
      });
    });
    interval(5000).subscribe(() => this.refresh());
    this.subscribe((states) => {
      if (this.stateLogger === undefined) {
        this.stateLogger = getLogger(this);
      }
      this.stateLogger.info({
        deviceId: this.id,
        name: this.name,
        model: this.model,
        type: this.constructor.name,
        ...states,
      });
    });
  }
}
