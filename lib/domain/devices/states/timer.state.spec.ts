import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import {
  testParseStateCalled,
  testParseStateNotCalled,
} from '../../../common/test-utils';
import { OpType, asOpCode } from '../../../common';
import { TimerState } from './timer.state';

describe('TimerState', () => {
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
  let state: TimerState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new TimerState(deviceModel, OpType.REPORT, 12);
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
              describe('with identifier is expected', () => {
                const identifier = 12;
                describe.each([0, 1])('and value enabled=%p', (on) => {
                  describe.each([1, 10, 500])(
                    'ande value duration=%p',
                    (duration) => {
                      it('sets the value', async () => {
                        expect(
                          await testParseStateCalled(state, {
                            op: {
                              command: [
                                asOpCode(
                                  opType,
                                  identifier,
                                  on,
                                  duration >> 8,
                                  duration % 256,
                                ),
                              ],
                            },
                          }),
                        ).toStrictEqual({
                          enabled: on === 1,
                          duration,
                        });
                      });
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
});
