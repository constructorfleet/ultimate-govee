import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { ColorTempState } from './color-temp.state';
import {
  testParseStateCalled,
  testParseStateNotCalled,
  testSetStateCalled,
  testSetStateNotCalled,
} from '../../../common/test-utils';

describe('ColorTempState', () => {
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
  let state: ColorTempState;
  let subscription: Subscription | undefined;
  describe('parse', () => {
    beforeEach(() => {
      state = new ColorTempState(deviceModel);
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
      describe('color temperature', () => {
        describe('within range', () => {
          it.each([2000, 4500, 9000])(
            'sets the value to %p',
            async (colorValue) => {
              expect(
                await testParseStateCalled(state, {
                  state: {
                    colorTemperature: {
                      current: colorValue,
                      min: 2000,
                      max: 9000,
                    },
                  },
                }),
              ).toStrictEqual({
                current: colorValue,
                min: 2000,
                max: 9000,
              });
            },
          );
        });
        describe('outside range', () => {
          it.each([100, 10000])(
            '%p, it does not update the value',
            async (colorValue) => {
              expect(
                await testParseStateNotCalled(state, {
                  state: {
                    colorTemperature: {
                      current: colorValue,
                      min: 2000,
                      max: 9000,
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
  describe('setState', () => {
    beforeEach(() => {
      state = new ColorTempState(deviceModel);
    });
    afterEach(() => {
      if (subscription !== undefined) {
        subscription.unsubscribe();
      }
    });
    describe('when nextState is', () => {
      describe('an invalid state value', () => {
        it.each([undefined, null])(
          '%p it does not set the value',
          async (val) => {
            expect(
              await testSetStateNotCalled(state, {
                current: val as unknown as number | undefined,
              }),
            ).not.toHaveBeenCalled();
          },
        );
      });
      describe('a valid state value', () => {
        describe('min and max are', () => {
          const min: number = 2000;
          const max: number = 9000;
          describe('specified', () => {
            describe('and current is', () => {
              describe('within the range', () => {
                it.each([2000, 9000, 3000, 4500, 7000])(
                  'issues command to set color temperature to %p',
                  async (colorTemperature) => {
                    const command = await testSetStateCalled(state, {
                      range: {
                        min,
                        max,
                      },
                      current: colorTemperature,
                    });
                    expect(command).toHaveProperty('commandId');
                    expect(command.commandId).toBeDefined();
                    expect(command).toHaveProperty('data');
                    expect(command.data).toHaveProperty('colorTemInKelvin');
                    expect(command.data.colorTemInKelvin).toBeDefined();
                    expect(command.data.colorTemInKelvin).toBeCloseTo(
                      colorTemperature,
                    );
                  },
                );
              });
              describe('outside the range', () => {
                it.each([1999, 10000, 500, -1])(
                  '%p, command is ignored',
                  async (colorTemperature) => {
                    expect(
                      await testSetStateNotCalled(state, {
                        range: {
                          min,
                          max,
                        },
                        current: colorTemperature,
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
  });
});
