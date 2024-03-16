import { DeviceModel } from '../devices.model';
import { Version } from '../version.info';
import { Subscription } from 'rxjs';
import {
  testParseStateCalled,
  testParseStateNotCalled,
  testSetStateCalled,
  testSetStateNotCalled,
} from '../../../common/test-utils';
import { Optional, OpType, asOpCode } from '../../../common';
import { DisplayScheduleState } from './display-schedule.state';

describe('DisplayScheduleState', () => {
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
  let state: DisplayScheduleState;

  describe('parse', () => {
    let subscription: Subscription | undefined;

    beforeEach(() => {
      state = new DisplayScheduleState(deviceModel, OpType.REPORT, 18);
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
          '{ "state": { "display": {"on": true, "from": { "hour": 0, "minute": 5}, "to": { "hour": 5, "minute": 30}}}}',
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
              describe('is expected', () => {
                const identifier = 18;
                describe.each([0, 1])('with %p for on', (on) => {
                  describe.each([0, 5, 10, 15])(
                    'with %p for fromHour',
                    (fromHour) => {
                      describe.each([0, 15, 30, 45])(
                        'with %p for fromMinute',
                        (fromMinute) => {
                          describe.each([2, 6, 12, 20])(
                            'with %p for toHour',
                            (toHour) => {
                              describe.each([10, 20, 40])(
                                'with %p for toMinute',
                                (toMinute) => {
                                  it('sets the state', async () => {
                                    expect(
                                      await testParseStateCalled(state, {
                                        op: {
                                          command: [
                                            asOpCode(
                                              opType,
                                              identifier,
                                              on,
                                              fromHour,
                                              fromMinute,
                                              toHour,
                                              toMinute,
                                            ),
                                          ],
                                        },
                                      }),
                                    ).toStrictEqual({
                                      on: on === 1,
                                      from: {
                                        hour: fromHour,
                                        minute: fromMinute,
                                      },
                                      to: {
                                        hour: toHour,
                                        minute: toMinute,
                                      },
                                    });
                                  });
                                },
                              );
                            },
                          );
                        },
                      );
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

  describe('setState', () => {
    describe('when passed', () => {
      describe('an invalid state value', () => {
        it.each([undefined, null])(
          '%p it does not set the value',
          async (val) => {
            expect(
              await testSetStateNotCalled(
                state,
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                val as unknown as Optional<boolean>,
              ),
            ).not.toHaveBeenCalled();
          },
        );
      });
      describe('a valid state value', () => {
        describe('with on=false', () => {
          const on = false;
          describe.each([0, 10])('with fromHour=%p', (fromHour) => {
            describe.each([15, 45])('with fromMinute=%p', (fromMinute) => {
              describe.each([5, 12])('with toHour=%p', (toHour) => {
                describe.each([20, 50])('with toMinute=%p', (toMinute) => {
                  it('sets value with on = false', async () => {
                    const command = await testSetStateCalled(state, {
                      on,
                      from: {
                        hour: fromHour,
                        minute: fromMinute,
                      },
                      to: {
                        hour: toHour,
                        minute: toMinute,
                      },
                    });
                    expect(command).toBeDefined();
                    expect(command.commandId).toBeDefined();
                    expect(command).toHaveProperty('data');
                    expect(command.data).toHaveProperty('command');
                    expect(command.data.command).toBeDefined();
                    expect(command.data.command).toHaveLength(1);
                    expect(command.data?.command?.at(0)).toEqual(
                      expect.arrayContaining(
                        asOpCode(OpType.COMMAND, 18, 0x00),
                      ),
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
});
