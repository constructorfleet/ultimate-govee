import { DeviceModel } from '../../../devices.model';
import { Version } from '../../../version.info';
import {
  BiologicalPresenceState,
  EnablePresenceFlags,
  EnablePresenceState,
  MMWavePresenceState,
} from './presence.states';
import { OpType, asOpCode } from '../../../../../common';
import {
  testParseStateCalled,
  testParseStateNotCalled,
  testSetStateCalled,
  testSetStateNotCalled,
} from '../../../../../common/test-utils';

const deviceModel: DeviceModel = new DeviceModel({
  id: '01:02:03:04:05:06:07:08',
  ic: 0,
  name: 'Test device',
  category: 'Home Improvement',
  categoryGroup: 'Sensors',
  model: 'H7567',
  modelName: 'Presence Sensor',
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

describe('MMWavePresenceState', () => {
  let state: MMWavePresenceState;

  describe('parse', () => {
    beforeEach(() => {
      state = new MMWavePresenceState(deviceModel);
    });

    describe('when passed', () => {
      describe('an invalid', () => {
        describe('state argument', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {}),
            ).not.toHaveBeenCalled();
          });
        });
        describe('op codes with different OpType', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {
                op: { command: [[0x02, 0x02, 0x01]] },
              }),
            ).not.toHaveBeenCalled();
          });
        });
        describe('op codes with different identifier', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {
                op: { command: [[OpType.REPORT, 0x02, 0x01]] },
              }),
            ).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe('a valid', () => {
      describe('op code', () => {
        describe('with value [170,1,1,0,91,0,0,93,0,0,2,195,0,0,0,0,1,0,0,108]', () => {
          it('sets the value to detected, 91cm, 707s', async () => {
            expect(
              await testParseStateCalled(state, {
                op: {
                  command: [
                    [
                      170, 1, 1, 0, 91, 0, 0, 93, 0, 0, 2, 195, 0, 0, 0, 0, 1,
                      0, 0, 108,
                    ],
                  ],
                },
              }),
            ).toStrictEqual({
              detected: true,
              distance: {
                value: 91,
                unit: 'cm',
              },
              duration: {
                value: 707,
                unit: 's',
              },
              type: 'mmWave',
            });
          });
        });
        describe('with value [170,1,0,2,1,1,0,93,0,0,0,10,0,0,0,0,1,0,0,108]', () => {
          it('sets the value to not detected, 513cm, 10s', async () => {
            expect(
              await testParseStateCalled(state, {
                op: {
                  command: [
                    [
                      170, 1, 0, 2, 1, 1, 0, 93, 0, 0, 0, 10, 0, 0, 0, 0, 1, 0,
                      0, 108,
                    ],
                  ],
                },
              }),
            ).toStrictEqual({
              detected: false,
              distance: {
                value: 513,
                unit: 'cm',
              },
              duration: {
                value: 10,
                unit: 's',
              },
              type: 'mmWave',
            });
          });
        });
      });
    });
  });
});

describe('BiologicalPresenceState', () => {
  let state: BiologicalPresenceState;

  describe('parse', () => {
    beforeEach(() => {
      state = new BiologicalPresenceState(deviceModel);
    });

    describe('when passed', () => {
      describe('an invalid', () => {
        describe('state argument', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {}),
            ).not.toHaveBeenCalled();
          });
        });
        describe('op codes with different OpType', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {
                op: { command: [[0x02, 0x02, 0x01]] },
              }),
            ).not.toHaveBeenCalled();
          });
        });
        describe('op codes with different identifier', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {
                op: { command: [[OpType.REPORT, 0x02, 0x01]] },
              }),
            ).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe('a valid', () => {
      describe('op code', () => {
        describe('with value [170,1,1,0,91,0,0,93,0,0,2,195,0,0,0,0,1,0,0,108]', () => {
          it('sets the value to not detected, 93cm, 707s', async () => {
            expect(
              await testParseStateCalled(state, {
                op: {
                  command: [
                    [
                      170, 1, 1, 0, 91, 0, 0, 93, 0, 0, 2, 195, 0, 0, 0, 0, 1,
                      0, 0, 108,
                    ],
                  ],
                },
              }),
            ).toStrictEqual({
              detected: false,
              distance: {
                value: 93,
                unit: 'cm',
              },
              duration: {
                value: 707,
                unit: 's',
              },
              type: 'biological',
            });
          });
        });
        describe('with value [170,1,1,0,163,1,1,57,0,0,2,135,0,0,0,0,1,0,0,181]', () => {
          it('sets the value to detected, 317cm, 647s', async () => {
            expect(
              await testParseStateCalled(state, {
                op: {
                  command: [
                    [
                      170, 1, 1, 0, 163, 1, 1, 57, 0, 0, 2, 135, 0, 0, 0, 0, 1,
                      0, 0, 181,
                    ],
                  ],
                },
              }),
            ).toStrictEqual({
              detected: true,
              distance: {
                value: 313,
                unit: 'cm',
              },
              duration: {
                value: 647,
                unit: 's',
              },
              type: 'biological',
            });
          });
        });
      });
    });
  });
});

describe('EnablePresenceState', () => {
  let state: EnablePresenceState;
  describe('parse', () => {
    describe('when passed', () => {
      describe('an invalid', () => {
        beforeEach(() => {
          state = new EnablePresenceState(deviceModel);
        });
        describe('state argument', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {}),
            ).not.toHaveBeenCalled();
          });
        });
        describe('op codes with different OpType', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {
                op: { command: [[0x02, 0x02, 0x01]] },
              }),
            ).not.toHaveBeenCalled();
          });
        });
        describe('op codes with different identifier', () => {
          it('does not update the value', async () => {
            expect(
              await testParseStateNotCalled(state, {
                op: { command: [[OpType.REPORT, 0x02, 0x01]] },
              }),
            ).not.toHaveBeenCalled();
          });
        });
      });
    });
    describe('a valid', () => {
      describe('op code', () => {
        describe('with value [170,31,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,181]', () => {
          let actualState: EnablePresenceFlags;
          beforeAll(() => {
            state = new EnablePresenceState(deviceModel);
          });
          beforeEach(async () => {
            actualState = await testParseStateCalled(state, {
              op: {
                command: [
                  [
                    170, 31, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
                    181,
                  ],
                ],
              },
            });
          });
          it('sets the value to true, true', () => {
            expect(actualState).toStrictEqual({
              mmWaveEnabled: true,
              biologicalEnabled: true,
            });
          });
        });
        describe('setState with biologicalEnabled missing', () => {
          it('does return a command', async () => {
            expect(state.value).toStrictEqual({
              mmWaveEnabled: true,
              biologicalEnabled: true,
            });
            expect(
              await testSetStateCalled(state, { mmWaveEnabled: false }),
            ).toStrictEqual({
              command: 'multiSync',
              commandId: expect.any(String),
              data: {
                command: [asOpCode(OpType.COMMAND, 31, 1, 0)],
              },
            });
          });
        });
        describe('setState with mmWaveEnabled missing', () => {
          it('does return a command', async () => {
            expect(state.value).toStrictEqual({
              mmWaveEnabled: true,
              biologicalEnabled: true,
            });
            expect(
              await testSetStateCalled(state, { biologicalEnabled: false }),
            ).toMatchObject({
              command: 'multiSync',
              commandId: expect.any(String),
              data: {
                command: [asOpCode(OpType.COMMAND, 31, 0, 1)],
              },
            });
          });
        });
      });
    });
  });
  describe('setState', () => {
    beforeEach(() => {
      state = new EnablePresenceState(deviceModel);
    });
    describe('when nextState is', () => {
      describe('{}', () => {
        it('does not return a command', async () => {
          expect(await testSetStateNotCalled(state, {})).not.toHaveBeenCalled();
        });
      });
      describe('missing mmWaveEnabled and', () => {
        describe('current mmWaveEnabled is', () => {
          describe('undefined', () => {
            it('does not return a command', async () => {
              expect(
                await testSetStateNotCalled(state, { biologicalEnabled: true }),
              ).not.toHaveBeenCalled();
            });
          });
        });
      });
      describe('missing biologicalEnabled and', () => {
        describe('current biologicalEnabled is', () => {
          describe('undefined', () => {
            it('does not return a command', async () => {
              expect(
                await testSetStateNotCalled(state, { mmWaveEnabled: true }),
              ).not.toHaveBeenCalled();
            });
          });
        });
      });

      describe('not missing mmWaveEnabled and not missing biologicalEnabled', () => {
        it.each([
          [
            { mmWaveEnabled: true, biologicalEnabled: true },
            {
              data: {
                command: [asOpCode(OpType.COMMAND, 31, 1, 1)],
              },
            },
          ],
          [
            { mmWaveEnabled: false, biologicalEnabled: true },
            {
              data: {
                command: [asOpCode(OpType.COMMAND, 31, 1, 0)],
              },
            },
          ],
          [
            { mmWaveEnabled: true, biologicalEnabled: false },
            {
              data: {
                command: [asOpCode(OpType.COMMAND, 31, 0, 1)],
              },
            },
          ],
          [
            { mmWaveEnabled: false, biologicalEnabled: false },
            {
              data: {
                command: [asOpCode(OpType.COMMAND, 31, 0, 0)],
              },
            },
          ],
        ])(
          '%p returns as the command %p',
          async (nextState, expectedCommand) => {
            expect(state.value).toStrictEqual({});
            expect(await testSetStateCalled(state, nextState)).toMatchObject(
              expectedCommand,
            );
          },
        );
      });
    });
  });
});
