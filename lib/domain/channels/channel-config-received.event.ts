export class ChannelConfigReceivedEvent<
  ChannelName extends string,
  TConfig extends object,
> {
  constructor(
    readonly name: ChannelName,
    readonly config: TConfig,
  ) {}
}
