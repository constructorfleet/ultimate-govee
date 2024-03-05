import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { OpType } from '../../../common/op-code';
import { ColorRGBState } from './color-rgb.state';

describe('ColorRGBState', () => {
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
  let state: ColorRGBState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new ColorRGBState(deviceModel);
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
          ])('of %P, it does not update the value', (input) => {
            const data = JSON.parse(input);
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse(data);
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('op type', () => {
          it.each([0x00, 0x20, OpType.COMMAND])(
            'of %p, the value is not udpated',
            (opType) => {
              const subscriptionFn = jest.fn((color) =>
                expect(color).toBeUndefined(),
              );
              subscription = state.subscribe(subscriptionFn);
              const data = [opType, 0x05, 0x02];
              state.parse({ op: { command: [data] } });
              expect(subscriptionFn).not.toHaveBeenCalled();
            },
          );
        });
        describe('op identifier', () => {
          it.each([0x01, 0x20, 0x00])(
            'of %p, the value is not udpated',
            (identifier) => {
              const subscriptionFn = jest.fn((color) =>
                expect(color).toBeUndefined(),
              );
              subscription = state.subscribe(subscriptionFn);
              state.parse({
                op: { command: [[OpType.REPORT, identifier, 0x02]] },
              });
              expect(subscriptionFn).not.toHaveBeenCalled();
            },
          );
        });
        describe('op sub-identifier', () => {
          it.each([0x01, 0x00, 0x00])(
            'of %p, the value is not udpated',
            (identifier) => {
              const subscriptionFn = jest.fn((color) =>
                expect(color).toBeUndefined(),
              );
              subscription = state.subscribe(subscriptionFn);
              state.parse({
                op: { command: [[OpType.REPORT, 0x05, identifier]] },
              });
              expect(subscriptionFn).not.toHaveBeenCalled();
            },
          );
        });
      });
    });
    describe('a valid', () => {
      describe('color', () => {
        describe('under state', () => {
          it.each([
            { red: 255, green: 0, blue: 125 },
            { red: 0, green: 0, blue: 0 },
            { red: 100, green: 150, blue: 250 },
          ])('sets the value to %p', (colorValue) => {
            const subscriptionFn = jest.fn((color) =>
              expect(color).toEqual(colorValue),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse({ state: { color: colorValue } });
            expect(subscriptionFn).toHaveBeenCalledTimes(1);
          });
        });
        describe('as an op code', () => {
          it.each(['[255, 0, 125]', '[0, 0, 0]', '[100, 150, 250]'])(
            'sets the value to %p',
            (colorValue) => {
              const subscriptionFn = jest.fn((color) =>
                expect(color).toEqual({
                  red: JSON.parse(colorValue)[0],
                  green: JSON.parse(colorValue)[1],
                  blue: JSON.parse(colorValue)[2],
                }),
              );
              subscription = state.subscribe(subscriptionFn);
              const arg = {
                op: {
                  command: [
                    [OpType.REPORT, 0x05, 0x02, ...JSON.parse(colorValue)],
                  ],
                },
              };
              state.parse(arg);
              expect(subscriptionFn).toHaveBeenCalledTimes(1);
            },
          );
        });
      });
    });
  });
});
