import { BehaviorSubject } from 'rxjs';
import { DeviceModel } from '../devices.model';

type MessageData = {
  cmd?: string;
};

const StatusCommand = 'status';

export const filterCommands = (
  commands: number[][],
  type: number,
  identifier?: number,
) =>
  commands
    .filter((command) => {
      const [cmdType, cmdIdentifier] = command.slice(0, 2);
      if (identifier !== undefined) {
        return cmdIdentifier === identifier;
      }

      return cmdType === type;
    })
    .map((command) => command.slice(identifier === undefined ? 2 : 1));

export abstract class DeviceState<StateName extends string, StateValue> {
  protected stateValue!: BehaviorSubject<StateValue>;

  public get value(): StateValue {
    return this.stateValue.value;
  }
  public set value(value: StateValue) {
    this.stateValue.next(value);
  }

  constructor(
    protected readonly device: DeviceModel,
    public readonly name: StateName,
    initialValue: StateValue,
  ) {
    this.stateValue = new BehaviorSubject(initialValue);
    this.device.status.subscribe((status) => this.parse(status));
  }

  subscribe(
    ...params: Parameters<typeof this.stateValue.subscribe>
  ): ReturnType<typeof this.stateValue.subscribe> {
    return this.stateValue.subscribe(...params);
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  parseState(data: unknown) {}

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  parse(data: MessageData) {
    if (data.cmd !== StatusCommand) {
      return;
    }
    this.parseState(data);
  }
}

export type OpCommandData = {
  op?: {
    command?: number[][];
  };
} & MessageData;

export type OpCommandIdentifier = {
  opType: number;
  identifier?: number;
};

export abstract class DeviceOpState<
  StateName extends string,
  StateValue,
> extends DeviceState<StateName, StateValue> {
  protected readonly opType: number;
  protected readonly identifier: number | undefined;
  constructor(
    { opType = 0xaa, identifier }: OpCommandIdentifier,
    device: DeviceModel,
    name: StateName,
    initialValue: StateValue,
  ) {
    super(device, name, initialValue);
    this.opType = opType;
    this.identifier = identifier;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  parseOpCommand(opCommand: number[]) {}

  parse(data: OpCommandData) {
    if (data.cmd !== StatusCommand) {
      return;
    }

    const commands = data.op?.command ?? [];
    if (
      filterCommands(commands, this.opType, this.identifier).map((command) =>
        this.parseOpCommand(command),
      ).length === 0
    ) {
      this.parseState(data);
    }
  }
}
