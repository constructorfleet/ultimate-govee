import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import { ControlLockState } from './control-lock.state';
import {
  testParseStateCalled,
  testParseStateNotCalled,
  testSetStateCalled,
  testSetStateNotCalled,
} from '../../../common/test-utils';
import { Optional, OpType, asOpCode } from '../../../common';

describe('ControlLockState', () => {
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
  let state: ControlLockState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new ControlLockState(deviceModel, OpType.REPORT, 10);
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
              const identifier = 10;
              describe.each([0x00, 0x02, 0x10])('and value %p', (val) => {
                it('sets the value to false', async () => {
                  expect(
                    await testParseStateCalled(state, {
                      op: { command: [asOpCode(opType, identifier, val)] },
                    }),
                  ).toBe(false);
                });
              });
              describe('and value 0x01', () => {
                it('sets the value to true', async () => {
                  expect(
                    await testParseStateCalled(state, {
                      op: { command: [asOpCode(opType, identifier, 0x01)] },
                    }),
                  ).toBe(true);
                });
              });
            });
          });
        });
      });
    });
  });
  describe('setState', () => {
    describe('when passed', () => {
      describe('an invalid state value', () => {
        it.each([undefined, null])(
          '%p it does not set the value',
          async (val) => {
            expect(
              await testSetStateNotCalled(
                state,
                val as unknown as Optional<boolean>,
              ),
            ).not.toHaveBeenCalled();
          },
        );
      });
      describe('a valid state value', () => {
        describe('false', () => {
          it('returns command to unlock controls', async () => {
            const command = await testSetStateCalled(state, false);
            expect(command).toHaveProperty('commandId');
            expect(command.commandId).toBeDefined();
            expect(command).toHaveProperty('data');
            expect(command.data).toHaveProperty('command');
            expect(command.data.command).toBeDefined();
            expect(command.data.command).toHaveLength(1);
            expect(command.data?.command?.at(0)).toEqual(
              expect.arrayContaining(asOpCode(OpType.COMMAND, 10, 0x00)),
            );
          });
        });
        describe('true', () => {
          it('returns command to lock controls', async () => {
            const command = await testSetStateCalled(state, true);
            expect(command).toHaveProperty('commandId');
            expect(command.commandId).toBeDefined();
            expect(command).toHaveProperty('data');
            expect(command.data).toHaveProperty('command');
            expect(command.data.command).toBeDefined();
            expect(command.data.command).toHaveLength(1);
            expect(command.data?.command?.at(0)).toEqual(
              expect.arrayContaining(asOpCode(OpType.COMMAND, 10, 0x01)),
            );
          });
        });
      });
    });
  });
});
