import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { BrightnessState } from './brightness.state';
import { OpType, asOpCode } from '../../../common/op-code';
import {
  testParseStateCalled,
  testParseStateNotCalled,
} from '../../../common/test-utils';

describe('BrightnessState', () => {
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
  let state: BrightnessState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new BrightnessState(deviceModel);
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
            '{ "state": { "bright": 10 } }',
            '{ "brightness": 10 }',
          ])('does not update the value', (input) => {
            const data = JSON.parse(input);
            const subscriptionFn = jest.fn((active) =>
              expect(active).toBeUndefined(),
            );
            subscription = state.subscribe(subscriptionFn);
            state.parse(data);
            expect(subscriptionFn).not.toHaveBeenCalled();
          });
        });
        describe('op code', () => {
          it.each([-1, 100.1, 1000])(
            'of %p, the value is not udpated',
            async (value) => {
              expect(
                await testParseStateNotCalled(state, {
                  op: { command: [asOpCode(value)] },
                }),
              ).not.toHaveBeenCalled();
            },
          );
        });
      });
    });
    describe('a valid', () => {
      describe('brightness', () => {
        describe('under state', () => {
          it.each([1, 5, 51, 90, 100])(
            'sets the value to %p',
            async (brightnessLevel) => {
              expect(
                await testParseStateCalled(state, {
                  state: { brightness: brightnessLevel },
                }),
              ).toBeCloseTo(brightnessLevel);
            },
          );
        });
        describe('as an op code', () => {
          it.each([0, 5, 51, 90, 100])(
            'sets the value to %p',
            async (brightnessLevel) => {
              expect(
                await testParseStateCalled(state, {
                  op: {
                    command: [asOpCode(OpType.REPORT, 4, brightnessLevel)],
                  },
                }),
              ).toBeCloseTo(brightnessLevel);
            },
          );
        });
      });
    });
  });
});
