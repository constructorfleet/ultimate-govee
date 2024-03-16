import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import {
  testParseStateCalled,
  testParseStateNotCalled,
} from '../../../common/test-utils';
import { OpType, asOpCode } from '../../../common';
import { SegmentCountState } from './segment-count.state';

describe('SegmentCountState', () => {
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
  let state: SegmentCountState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new SegmentCountState(deviceModel, OpType.REPORT, 17);
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
        ])('of %P, it does not update the value', (input) => {
          const data = JSON.parse(input);
          const subscriptionFn = jest.fn((connected) =>
            expect(connected).toBeUndefined(),
          );
          subscription = state.subscribe(subscriptionFn);
          state.parse(data);
          expect(subscriptionFn).not.toHaveBeenCalled();
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
                it.each([0x01, 0x05, 0x31])(
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
              const identifier = 17;
              describe('and value [0, 0, 15]', () => {
                it('sets the value to 15', async () => {
                  expect(
                    await testParseStateCalled(state, {
                      op: { command: [asOpCode(opType, identifier, 0, 0, 15)] },
                    }),
                  ).toBe(15);
                });
              });
              describe('and value [0, 0, 8]', () => {
                it('sets the value to 8', async () => {
                  expect(
                    await testParseStateCalled(state, {
                      op: { command: [asOpCode(opType, identifier, 0, 0, 8)] },
                    }),
                  ).toBe(8);
                });
              });
            });
          });
        });
      });
    });
  });
});
