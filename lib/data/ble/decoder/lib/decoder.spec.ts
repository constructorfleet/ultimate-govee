import { Decoder } from './decoder';
import { DataSource, DecodeDevice, DecoderFn, Operations } from './types';
import { v4 as uuidv4 } from 'uuid';

const makeDevice = (name: string, manufacturerData: string): DecodeDevice => ({
  id: '0B:00:19:3D:31:51:34:F7',
  name,
  manufacturerData,
  serviceData: [
    {
      uuid: uuidv4().replace('-', ''),
      data: '041009760c',
    },
  ],
  uuid: uuidv4().replace('-', ''),
  macAddress: '0fd43832317d60ff',
});

describe('Decoder', () => {
  describe('postProcessing', () => {
    describe('H5074', () => {
      describe('tempc offset: 6, length: 4, reverse: true, canBeNegative: true', () => {
        const offset = 6;
        const length = 4;
        const reverse = true;
        const canBeNegative = true;
        it.each([
          ['88ec00c408231d6402', 2244],
          ['88ec00a0facc176402', -1376],
          ['88ec001b0a9b196402', 2587],
        ])('given %p expect %p', (input, output) => {
          const result = Decoder.value_from_hex_string(
            input,
            offset,
            length,
            reverse,
            canBeNegative,
          );
          expect(result).toEqual(output);
        });
      });
      describe('hum offset: 10, length: 4, reverse: true, canBeNegative: false', () => {
        const offset = 10;
        const length = 4;
        const reverse = true;
        const canBeNegative = false;
        it.each([
          ['88ec00c408231d6402', 7459],
          ['88ec00a0facc176402', 6092],
          ['88ec001b0a9b196402', 6555],
        ])('given %p expect %p', (input, output) => {
          const result = Decoder.value_from_hex_string(
            input,
            offset,
            length,
            reverse,
            canBeNegative,
          );
          expect(result).toEqual(output);
        });
      });
      describe('batt offset: 14, length: 2, reverse: false, canBeNegative: false', () => {
        const offset = 14;
        const length = 2;
        const reverse = false;
        const canBeNegative = false;
        it.each([
          ['88ec00c408231d6402', 100],
          ['88ec00a0facc174502', 69],
          ['88ec001b0a9b191002', 16],
        ])('given %p expect %p', (input, output) => {
          const result = Decoder.value_from_hex_string(
            input,
            offset,
            length,
            reverse,
            canBeNegative,
          );
          expect(result).toEqual(output);
        });
      });
    });
  });
  describe('value_from_hex_string', () => {
    describe('H5106', () => {
      describe('tempc offset: 8, length: 8, reverse: false, canBeNegative: false', () => {
        const offset = 8;
        const length = 8;
        const reverse = false;
        const canBeNegative = false;
        it.each([
          [
            '010001010d915f9a4c000215494e54454c4c495f524f434b535f48575075f2ff0c',
            227631002,
          ],
          ['010001010ddf25cc', 232728012],
          ['0100010181aa77cf', 2175432655],
        ])('given %p expect %p', (input, output) => {
          const result = Decoder.value_from_hex_string(
            input,
            offset,
            length,
            reverse,
            canBeNegative,
          );
          expect(result).toEqual(output);
        });
      });
    });
    describe('H5179', () => {
      describe('tempc offset: 12, length: 4, reverse: true, canBeNegative: true', () => {
        const offset = 12;
        const length = 4;
        const reverse = true;
        const canBeNegative = true;
        it.each([['0188ec000101ee07581641', 2030]])(
          'given %p expect %p',
          (input, output) => {
            const result = Decoder.value_from_hex_string(
              input,
              offset,
              length,
              reverse,
              canBeNegative,
            );
            expect(result).toEqual(output);
          },
        );
      });
      describe('hum offset: 16, length: 4, reverse: true, canBeNegative: false', () => {
        const offset = 16;
        const length = 4;
        const reverse = true;
        const canBeNegative = false;
        it.each([['0188ec000101ee07581641', 5720]])(
          'given %p expect %p',
          (input, output) => {
            const result = Decoder.value_from_hex_string(
              input,
              offset,
              length,
              reverse,
              canBeNegative,
            );
            expect(result).toEqual(output);
          },
        );
      });
      describe('batt offset: 20, length: 4, reverse: false, canBeNegative: false', () => {
        const offset = 20;
        const length = 4;
        const reverse = false;
        const canBeNegative = false;
        it.each([['0188ec000101ee07581641', 65]])(
          'given %p expect %p',
          (input, output) => {
            const result = Decoder.value_from_hex_string(
              input,
              offset,
              length,
              reverse,
              canBeNegative,
            );
            expect(result).toEqual(output);
          },
        );
      });
    });
  });
  describe('decode', () => {
    describe('H5072', () => {
      const name = 'H5072';
      describe('tempc', () => {
        describe.each([
          ['value_from_hex_data', 'manufacturerdata', 6, 6, false, false],
        ])(
          'decoder:%p datasource: %p offset: %p length: %p reverse: %p canBeNegative: %p',
          (decoder, dataSource, offset, length, reverse, canBeNegative) => {
            describe.each([[{ operations: ['/', 1000, '>', 0, '/', 10] }]])(
              'post-processing %p',
              ({ operations }) => {
                it.each([
                  ['88ec000418ee6400', 26.85],
                  ['88ec0004344b6400', 27.55],
                ])('given %p expect %p', (input, output) => {
                  expect(
                    Decoder.decode(
                      makeDevice(name, input),
                      [
                        decoder as DecoderFn,
                        dataSource as DataSource,
                        offset,
                        length,
                        reverse,
                        canBeNegative,
                      ],
                      [...(operations as Operations)],
                    ),
                  ).toBeCloseTo(output);
                });
              },
            );
          },
        );
      });
      describe('_tempc', () => {
        describe.each([
          ['value_from_hex_data', 'manufacturerdata', 6, 6, false, false],
        ])(
          'decoder:%p datasource: %p offset: %p length: %p reverse: %p canBeNegative: %p',
          (decoder, dataSource, offset, length, reverse, canBeNegative) => {
            describe.each([
              [{ operations: ['&', 8388607, '/', 10000, '*', -1] }],
            ])('post-processing %p', ({ operations }) => {
              it.each([['88ec00811f096400', -7.3481]])(
                'given %p expect %p',
                (input, output) => {
                  expect(
                    Decoder.decode(
                      makeDevice(name, input),
                      [
                        decoder as DecoderFn,
                        dataSource as DataSource,
                        offset,
                        length,
                        reverse,
                        canBeNegative,
                      ],
                      [...(operations as Operations)],
                    ),
                  ).toBeCloseTo(output);
                },
              );
            });
          },
        );
      });
      describe('hum', () => {
        describe.each([
          ['value_from_hex_data', 'manufacturerdata', 6, 6, false, false],
        ])(
          'decoder:%p datasource: %p offset: %p length: %p reverse: %p canBeNegative: %p',
          (decoder, dataSource, offset, length, reverse, canBeNegative) => {
            describe.each([
              [{ operations: ['&', 8388607, '%', 1000, '/', 10] }],
            ])('post-processing %p', ({ operations }) => {
              it.each([
                ['88ec000418ee6400', 52.6],
                ['88ec00811f096400', 48.1],
                ['88ec0004344b6400', 53.1],
              ])('given %p expect %p', (input, output) => {
                expect(
                  Decoder.decode(
                    makeDevice(name, input),
                    [
                      decoder as DecoderFn,
                      dataSource as DataSource,
                      offset,
                      length,
                      reverse,
                      canBeNegative,
                    ],
                    [...(operations as Operations)],
                  ),
                ).toBeCloseTo(output);
              });
            });
          },
        );
      });
      describe('batt', () => {
        describe.each([
          ['value_from_hex_data', 'manufacturerdata', 12, 2, false, false],
        ])(
          'decoder:%p datasource: %p offset: %p length: %p reverse: %p canBeNegative: %p',
          (decoder, dataSource, offset, length, reverse, canBeNegative) => {
            describe.each([[{ operations: [] }]])(
              'post-processing %p',
              ({ operations }) => {
                it.each([
                  ['88ec000418ee6400', 100],
                  ['88ec00811f096400', 100],
                  ['88ec0004344b6400', 100],
                ])('given %p expect %p', (input, output) => {
                  expect(
                    Decoder.decode(
                      makeDevice(name, input),
                      [
                        decoder as DecoderFn,
                        dataSource as DataSource,
                        offset,
                        length,
                        reverse,
                        canBeNegative,
                      ],
                      [...(operations as Operations)],
                    ),
                  ).toBeCloseTo(output);
                });
              },
            );
          },
        );
      });
    });
  });
});
