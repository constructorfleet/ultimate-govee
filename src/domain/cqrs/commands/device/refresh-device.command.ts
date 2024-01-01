export class RefreshDeviceCommand {
  constructor(
    public readonly deviceId: string,
    public readonly model: string,
  ) {}
}
