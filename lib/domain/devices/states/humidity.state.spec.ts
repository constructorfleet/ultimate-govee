import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { HumidityState } from './humidity.state';
import {
  testParseStateCalled,
  testParseStateNotCalled,
} from '../../../common/test-utils';

describe('HumidityState', () => {
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
  let state: HumidityState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new HumidityState(deviceModel);
    });

    afterEach(() => {
      if (subscription !== undefined) {
        subscription.unsubscribe();
      }
    });

    describe('when passed', () => {
      describe('an invalid', () => {
        describe('state argument', () => {
          it.each([
            '{}',
            '{ "state": { "clr": {} } }',
            '{ "state": { "color": null } }',
            '{ "color": 10 }',
          ])('of %P, it does not update the value', async (input) => {
            expect(
              await testParseStateNotCalled(state, JSON.parse(input)),
            ).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe('a', () => {
      describe('humidity', () => {
        describe('within range', () => {
          it.each([10, 45, 60.5])('sets the value to %p', async (humditiy) => {
            expect(
              await testParseStateCalled(state, {
                state: {
                  humidity: {
                    current: humditiy,
                    min: 0,
                    max: 100,
                  },
                },
              }),
            ).toStrictEqual({
              calibration: undefined,
              current: humditiy,
              range: {
                min: 0,
                max: 100,
              },
              raw: humditiy,
            });
          });
        });
        describe('outside range', () => {
          it.each([-10, 10000])(
            '%p, it does not update the value',
            async (humidity) => {
              expect(
                await testParseStateNotCalled(state, {
                  state: {
                    humidity: {
                      current: humidity,
                      min: -5,
                      max: 90,
                    },
                  },
                }),
              ).not.toHaveBeenCalled();
            },
          );
        });
      });
    });
  });
});
