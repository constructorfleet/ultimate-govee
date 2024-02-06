import { BehaviorSubject, Observer, Subject, Subscription } from 'rxjs';
import { Optional, Ignorable } from '@govee/common';
import { Logger } from '@nestjs/common';
import { GoveeDeviceCommand } from '@govee/data';
import { DeviceModel } from '../devices.model';

type MessageData = {
  cmd?: string;
};

const StatusCommand = 'status';

export const filterCommands = (
  commands: number[][],
  type?: Optional<number>,
  identifier?: Optional<number>,
) =>
  commands
    .filter((command) => {
      if (type === undefined) {
        return true;
      }

      const [cmdType, cmdIdentifier] = command.slice(0, 2);
      if (identifier !== undefined) {
        return cmdIdentifier === identifier;
      }

      return cmdType === type;
    })
    .map((command) => {
      if (type === undefined && identifier === undefined) {
        return command;
      }
      if (identifier === undefined) {
        return command.slice(1);
      }
      return command.slice(2);
    });

export abstract class DeviceState<StateName extends string, StateValue> {
  protected readonly logger: Logger = new Logger(this.constructor.name);

  protected readonly stateValue: BehaviorSubject<StateValue>;
  readonly commandBus: Subject<Omit<GoveeDeviceCommand, 'deviceId'>> =
    new Subject();

  subscribe(
    observerOrNext?:
      | Partial<Observer<StateValue>>
      | ((value: StateValue) => void),
  ): Subscription {
    return this.stateValue.subscribe(observerOrNext);
  }

  public get value(): StateValue {
    return this.stateValue.value;
  }

  constructor(
    protected readonly device: DeviceModel,
    public readonly name: StateName,
    initialValue: StateValue,
  ) {
    this.stateValue = new BehaviorSubject(initialValue);
    this.device.status?.subscribe((status) => this.parse(status));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  parseState(data: unknown) {
    // no-op
  }

  parse(data: MessageData) {
    if (data.cmd && data.cmd !== StatusCommand) {
      return;
    }
    this.parseState(data);
  }

  setState(nextState: StateValue): any {
    return this.stateToCommand(nextState);
  }

  protected stateToCommand(state: StateValue): any {
    return state;
  }
}

export type OpCommandData = {
  op?: {
    command?: number[][];
  };
} & MessageData;

export type OpCommandIdentifier = {
  opType?: Ignorable<Optional<number>>;
  identifier?: Ignorable<Optional<number>>;
};

export type ParseOption = 'opCode' | 'state' | 'both';

export abstract class DeviceOpState<
  StateName extends string,
  StateValue,
> extends DeviceState<StateName, StateValue> {
  protected readonly opType: Ignorable<Optional<number>>;
  protected readonly identifier: Ignorable<Optional<number>>;
  constructor(
    { opType, identifier }: OpCommandIdentifier,
    device: DeviceModel,
    name: StateName,
    initialValue: StateValue,
    private readonly parseOption: ParseOption = 'opCode',
  ) {
    super(device, name, initialValue);
    this.opType = opType;
    this.identifier = identifier;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  parseOpCommand(opCommand: number[]) {}

  parse(data: OpCommandData) {
    const commands = data.op?.command ?? [];
    if (['both', 'opCode'].includes(this.parseOption)) {
      this.filterOpCommands(commands).forEach((command) =>
        this.parseOpCommand(command),
      );
    }
    if (['both', 'state'].includes(this.parseOption)) {
      this.parseState(data);
    }
  }

  protected filterOpCommands(opCommands: number[][]): number[][] {
    if (this.opType === null) {
      return opCommands;
    }
    return filterCommands(
      opCommands,
      this.opType,
      this.identifier || undefined,
    );
  }
}
