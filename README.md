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

## Control Channels

The primary control channel is AWS IoT Core - this is a Pub/Sub system that
works with any WiFi-enabled device (and soon any device behind a disributed
gateway). If you have a bluetooth adapter, you can enable the BLE control
channel to control those directly; however, if you try to enable this and do not
have a bluetooth adapter - it will cause the library to crash.

This works on OSX and Linux system. Have not tested Windows.

## Devices

Devices are composed of various states, some allow you to change them while
others are informational only. Each state keeps a history for the previous 5
state values and if it's a controllable state you can set it to one of them by
invoking the `previousState` method, which accepts a value between 0 and 5 (0
means set it to the current state, 1 the previous state, all the way to 5 being
the 5th previous state). This allows for automations like "When motion: set
RGBICLightDevice's wholecolor state to white and brightness state to 100%; On
motion clear return to the previous brightness and previous light effect"

```typescript
const device: RGBICLight;
onMotion() {
  device.wholeColor().setState({red: 255, green: 255, blue: 255});
  device.brightness().setState(100);
}
onMotionClear() {
  device.ligthEffect().previousState(1);
  device.brightness().previousState(1);
}
```

### States

- `isActive` - Whether the device is "active", i.e. the Purifier is running
- `batteryLevel` - The remaining battery level as a percentage (if device is
  battery powered)
- `brightness` - The brighness (as percentage) for the device (in the case of
  RGBICLights, this is the entire device)
- `colorRGB` - Color of a light, for bulb and strips this is for the device
  itself
- `colorTemp` - The color temperature for the light (2000K - 9000K)
- `connected` - This should indicate whether the device is online, however it's
  not consistent
- `controlLock` - Locks or unlocks the physical controls on the device
- `displaySchedule` - Sets when the display on the device is to be illuminated
- `filterExpired` - Flag indicating the device's filter is needing replaced
- `filterLife` - The remaining life of the device's filter (as a percentage),
  not all devices report this
- `humidity` - An object containing the valid relative humidity range, current
  reading, calibration settings and raw value
- `lightEffect` - Contains the list of valid light effects for the device, you
  can control the state via the effect name or the numeric code
- `mode` - The active mode of the device, this state is meaningless without a
  specific device implementation
- `nightLight` - Control the night light feature of the device, if the device
  has one
- `power` - Whether the device is on or off, this is similar to
- `isActive` but applies primarily to switch and light devices
- `segmentCount` - Provides the number of controllable segments for RGBICLight
  devices
- `temperature` - An object containing the valid temperature range, current
  reading, calibration settings and raw value
- `timer`- Allows interacting with the device's timer feature (setting the start
  and end for operation)
- `waterShortage` - Flag indicating the device is out of water.

### Humidifiers

- `mistLevel` - The amount of mist the humidifier is emitting
- `targetHumidity` - If paired with Hygrometer or one is integrated, sets the
  relative humidity at which the device will pause activity
- `uvc` - Some humidifiers offer a UVC sterilization feature, set this to true
  to enable sanitization
- `manualMode` - Simple mode where you can control the mistLevel directly
  `customMode`
- - Set three mist levels and their durations, once the first is completed it
    starts the second, the third can be indefinite or a finite duration
- `autoMode` - Humidifier will operate automatically until the target humidity
  is reached

### Ice Makers

- `nuggetSize` - Set the size of the ice cubes
- `makingIce` - Analogous to `isActive`, starts or stops the ice production
- `iceMakerStatus` - The status of the device: washing, idle, making ice, etc.
- `scheduledStart` - Allows you to set a time in the future to start ice
  production
- `basketFull` - Flag indicating the basket is full and needs to be emptied.

### Purifier

- `fanSpeed` - Reported as a percentage, indicates how much the purifier is
  working. Some devices only allow 3 speeds, some 4.
- `manualMode` - Control the fan speed directly
- `customMode` - Set three speed settigns and their durations, once the first is
  complete it starts the second, the third can be indefinite or a finite
  duration
- `autoMode` - If paird with an air quality monitor or has one integrated, will
  purify the air until the air quality measurement is below the threshold

### Air Quality Monitor

- `pm25` - the PPM measurements of particles in the air
- `humdidity` - the measured ambient relative humidity
- `temprature` - the measured ambient temperature

### Hygrometer

- `humidity` - the measured ambient relative humidity
- `temperature` - the measure ambient temperature
- `batteryLevel` - Remaining battery level of the device

### RGB Lights

`micMode` - Makes the device sound reactive, various settings can be applied to
this mode such as sensitivity, colors and intensity `colorMode` - The color of
the light `brightness` - The brightness of the light `colorTemp` - The color
temperature of the light

### RGBIC LIghts

- `micMode` - set the device to be audio reactive, you can change the colors,
  intensity, how the colors change (chase, pulse, etc)
- `wholeColorMode` - controls the color of the entire device
- `segmentedColorMode` - controls color and brightness of the individual light
  segments
- `lightEffect` - activates one of the numerous light effects defined by govee
  (the application automatically retrieves this list)
- `advancedColorMod` - This allows for you to create DIY light effects (this is
  not implemented yet)

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
