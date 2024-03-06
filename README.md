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
npm install --save @constructorfleet/ultimate-govee
```

## Running the library

**NOTE** All options for this module are optional, but at least one control
channel must be enabled to interact with devices

First, import the `UltimateGoveeModule`:

```typescript
@Module({
  import: [UltimateGoveeModule.forRootAsync({
    persist: {
      rootDirectory: 'path/to/persistent/storage', // Path to persistent storage, as of now, it writs a lot for debugging
    },
    auth: {
      refreshMargin: 5000 // Number of milliseconds before token expires to reauthenticate with Govee
    },
    channels: {
      ble: {
        enabled: true, // Whether to enable the BLE control channel (if you do not have BLE adapter, this MUST be false)
        deviceIds: [ // List of IDs for devices to command and control - these are not the BLE address!
          "00:11:22:33:44:55:66:77:88"
        ]
      },
      iot: {
        enabled: true, // Whether to enable the AWS IoT Core control channel
      }
    }
  })]
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
nest test
```

## Future Work

- [x] - Configure control channels on initialization and during runtime.
- ~~[ ] - Configurable controllers.~~
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
