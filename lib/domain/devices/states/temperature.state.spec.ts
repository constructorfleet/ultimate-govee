import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { TemperatureState } from './temperature.state';
import {
  testParseStateCalled,
  testParseStateNotCalled,
} from '../../../common/test-utils';

describe('TemperatureState', () => {
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
  let state: TemperatureState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new TemperatureState(deviceModel);
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
      describe('a', () => {
        describe('temperature', () => {
          describe('within range', () => {
            it.each([10, 45, 60.5])(
              'sets the value to %p',
              async (temperature) => {
                await expect(temperature).toBeDefined();
                expect(
                  await testParseStateCalled(state, {
                    state: {
                      temperature: {
                        current: temperature,
                        min: 0,
                        max: 100,
                      },
                    },
                  }),
                ).toStrictEqual({
                  calibration: undefined,
                  current: temperature,
                  range: {
                    min: 0,
                    max: 100,
                  },
                  raw: temperature,
                });
              },
            );
          });
          describe('outside range', () => {
            it.each([-10, 10000])(
              '%p, it does not update the value',
              async (temperature) => {
                expect(
                  await testParseStateNotCalled(state, {
                    state: {
                      temperature: {
                        current: temperature,
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
});
