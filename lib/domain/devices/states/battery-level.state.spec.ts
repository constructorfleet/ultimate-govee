import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { BatteryLevelState } from './battery-level.state';

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
          it('does not update the value', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse({});
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('battery level state', () => {
          it.each([-1, 100.1, 1000])('of %p, the value is not udpated', () => {
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse({});
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe('a valid', () => {
      describe('battery', () => {
        describe('outside state', () => {
          it.each([0.001, 0.5, 51, 90, 100])(
            'sets the value to %p',
            (batteryLevel) => {
              const data: Record<string, any> = {};
              data['battery'] = batteryLevel;
              const subscriptionFn = jest.fn((battery) =>
                expect(battery).toBeCloseTo(batteryLevel),
              );
              subscription = state.subscribe(subscriptionFn);
              state.parse(data);
              expect(subscriptionFn).toHaveBeenCalledTimes(1);
            },
          );
        });
        describe('under state', () => {
          it.each([0.001, 0.5, 51, 90, 100])(
            'sets the value to %p',
            (batteryLevel) => {
              const subscriptionFn = jest.fn((battery) =>
                expect(battery).toBeCloseTo(batteryLevel),
              );
              subscription = state.subscribe(subscriptionFn);
              state.parse({ state: { battery: batteryLevel } });
              expect(subscriptionFn).toHaveBeenCalledTimes(1);
            },
          );
        });
      });
    });
  });
});
