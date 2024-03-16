import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import {
  testParseStateCalled,
  testParseStateNotCalled,
} from '../../../common/test-utils';
import { OpType, asOpCode } from '../../../common';
import { LightEffectState } from './light-effect.state';

describe('LightEffectState', () => {
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
  let state: LightEffectState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new LightEffectState(deviceModel, OpType.REPORT, [5, 4]);
      state.effects.set(0, {
        code: 0,
        name: 'Effect-0',
      });
      state.effects.set(100, {
        code: 100,
        name: 'Effect-100',
      });
      state.effects.set(1000, {
        code: 1000,
        name: 'Effect-1000',
      });
    });

    afterEach(() => {
      if (subscription !== undefined) {
        subscription.unsubscribe();
      }
    });

    describe('when passed', () => {
      describe('any state argument', () => {
        it.each([
          '{}',
          '{ "state": { "power": {} } }',
          '{ "state": { "off": null } }',
          '{ "online": true }',
        ])('of %P, it does not update the value', async (input) => {
          expect(
            await testParseStateNotCalled(state, JSON.parse(input)),
          ).not.toHaveBeenCalled();
        });
      });
      describe('an op code', () => {
        describe('with an opType that', () => {
          describe('is not expected', () => {
            it.each([0x01, 0x0f, 0x2a])(
              '%p, it does not update',
              async (opType) => {
                expect(
                  await testParseStateNotCalled(state, {
                    op: { command: [asOpCode(opType, 10, 5)] },
                  }),
                ).not.toHaveBeenCalled();
              },
            );
          });
          describe('is expected', () => {
            const opType = OpType.REPORT;
            describe('with identifier that', () => {
              describe('is not expected', () => {
                it.each([10, 68, 25])(
                  '%p, it does not update',
                  async (identifier) => {
                    expect(
                      await testParseStateNotCalled(state, {
                        op: { command: [asOpCode(opType, identifier, 5, 100)] },
                      }),
                    ).not.toHaveBeenCalled();
                  },
                );
              });
            });
            describe('is expected', () => {
              const identifier = [5, 4];
              describe.each([0, 100, 1000])('and value %p', (effectCode) => {
                it('sets the value', async () => {
                  expect(
                    await testParseStateCalled(state, {
                      op: {
                        command: [
                          asOpCode(
                            opType,
                            ...identifier,
                            effectCode >> 8,
                            effectCode % 256,
                          ),
                        ],
                      },
                    }),
                  ).toBe(state.effects.get(effectCode));
                });
              });
            });
          });
        });
      });
    });
  });
});
