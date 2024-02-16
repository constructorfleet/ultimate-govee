<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]:
  https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

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

[ ] Configure control channels on initialization and during runtime. [ ]
Configurable controllers [ ] Specify devices to listen for [ ] Device overrides
[ ] LAN control channel [ ] Govee OpenAPI control channel [ ] Tool for
facilitating device support

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors
and support by the amazing backers. If you'd like to join them, please
[read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Teagan42](https://blog.teagantotally.rocks)

## License

Nest is [MIT licensed](LICENSE).
