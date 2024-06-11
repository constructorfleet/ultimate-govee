import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { BatteryLevelState } from './battery-level.state';
import {
  testParseStateCalled,
  testParseStateNotCalled,
} from '../../../common/test-utils';

describe('BatteryLevelState', () => {
  const deviceModel: DeviceModel = new DeviceModel({
    id: '01:02:03:04:05:06:07:08',
    ic: 0,
    name: 'Test device',
    category: 'Generic',
    categoryGroup: 'Device',
    model: 'H7567',
    modelName: 'Some kind of device',
    goodsType: 30,
    pactType: 10,
    pactCode: 4,
    version: new Version('1.0.0', '2.0.0'),
    state: {},
    deviceExt: {
      externalResources: {
        imageUrl: 'https://example.com/H7567.png',
        onImageUrl: 'https://example.com/H7567-on.png',
        offImageUrl: 'https://example.com/H7567-off.png',
      },
    },
  });
  let state: BatteryLevelState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new BatteryLevelState(deviceModel);
    });

    afterEach(() => {
      if (subscription !== undefined) {
        subscription.unsubscribe();
      }
    });

    describe('when passed', () => {
      describe('an invalid', () => {
        describe('state argument', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {}),
            ).not.toHaveBeenCalled();
          });
        });
        describe('battery level state', () => {
          it.each([-1, 100.1, 1000])(
            'of %p, the value is not udpated',
            async (val) => {
              expect(
                await testParseStateNotCalled(state, {
                  state: { battery: val },
                }),
              ).not.toHaveBeenCalled();
            },
          );
        });
      });
    });
    describe('a valid', () => {
      describe('battery', () => {
        describe('outside state', () => {
          it.each([0.001, 0.5, 51, 90, 100])(
            'sets the value to %p',
            async (batteryLevel) => {
              const data: Record<string, any> = {};
              data['battery'] = batteryLevel;
              expect(await testParseStateCalled(state, data)).toBeCloseTo(
                batteryLevel,
              );
            },
          );
        });
        describe('under state', () => {
          it.each([0.001, 0.5, 51, 90, 100])(
            'sets the value to %p',
            async (batteryLevel) => {
              expect(
                await testParseStateCalled(state, {
                  state: { battery: batteryLevel },
                }),
              ).toBeCloseTo(batteryLevel);
            },
          );
        });
      });
    });
  });
});
