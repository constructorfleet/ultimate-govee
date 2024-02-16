# Ultimate Govee

## Description

Provides command and control interface for interacting with
[Govee](https://govee.com) via Bluetooth LE, AWS IoT Core, LAN (TODO), and Govee
OpenAPI Developer Platform (TODO).

If a device type is known, it will be categorized and have type-specific device
states. Supported types so far:

- Purifiers
- Humidifiers
- RGB Lights (Bulbs, Strips, etc.)
- RGBIC Lights (Bulbs, Strips, Glide, etc.)
- Air Quality Monitors
- Hygrometers
- Ice Makers

## Installing the library

```bash
$ npm install --save @constructorfleet/ultimate-govee
```

## Running the library

First, import the `UltimateGoveeModule`:

```typescript
@Module({
  import: [UltimateGoveeModule]
  ...
})
export class AppModule {}
```

Then, inject the `UltimateGoveeService`:

```typescript
@Injectable()
export class AppService {
  constructor(private readonly govee: UltimateGoveeService, ...) {}
}
```

Subscribe to device discovery events:

```typescript
this.govee.deviceDiscovered.subscribe((device: Device) => {
  // Get the device value of all states
  console.dir(device.currentState);
  // Get a specific device state
  device.state(FanSpeedStateName);

  // Issue a command to the device state
  device.state('mistLevel').setState(4);
  device.state('scheduledStart').setState({
    enabled: true,
    startHour: 14,
    startMinute: 30,
  });
});
```

Connect using the user's credentials:

```typescript
this.govee.connect(username, password);
```

## Test

```bash
$ nest test
```

## Future Work

- [ ] - Configure control channels on initialization and during runtime.
- [ ] - Configurable controllers.
- [ ] - Specify devices to listen for.
- [ ] - Device overrides.
- [ ] - LAN control channel.
- [ ] - Govee OpenAPI control channel.
- [ ] - Tool for facilitating device support.

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors
and support by the amazing backers. If you'd like to join them, please
[read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Teagan42](https://blog.teagantotally.rocks)

## License

Ultimate-Govee is GPLv3 Licensed. Nest is MIT licensed.

Special Thanks:

- https://github.com/theengs/decoder
- https://github.com/Bluetooth-Devices/govee-ble
