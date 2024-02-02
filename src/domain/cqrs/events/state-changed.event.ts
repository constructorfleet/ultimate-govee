export class StateChangedEvent<StateName extends string, StateValue> {
  constructor(
    readonly deviceId: string,
    readonly stateName: StateName,
    readonly state: StateValue,
  ) {}
}
