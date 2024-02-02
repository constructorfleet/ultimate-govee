export class StateQuery<StateName extends string> {
  constructor(
    readonly deviceId: string,
    readonly stateName: StateName,
  ) {}
}
