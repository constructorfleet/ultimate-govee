import { Subscription } from 'rxjs';
import { Optional } from '@govee/common';
import { DeviceModel } from '../../../devices.model';
import {
  DeviceState,
  SegmentCountStateName,
  ModeStateName,
  BrightnessState,
  BrightnessStateName,
  PowerState,
  PowerStateName,
} from '../../../states';
import { Device } from '../../device';
import {
  WholeColorModeStateName,
  ColorModeState,
  SegmentColorModeStateName,
  RGBICActiveState,
  WholeColor,
  SegmentColorModeState,
} from './rgbic-light.modes';

export const SegmentsStateName: 'segments' = 'segments' as const;
export type SegmentsStateName = typeof SegmentsStateName;

type Segment = {
  on?: boolean;
  brightness?: number;
  color?: {
    red: number;
    green: number;
    blue: number;
  };
};

export class RGBICSegmentsState extends DeviceState<
  SegmentsStateName,
  Segment[]
> {
  private subscription: Optional<Subscription>;
  private applyToWhole: boolean = false;
  private on: Optional<boolean>;
  private brightness: Optional<number>;
  private segments: Segment[] = [];

  constructor(deviceModel: DeviceModel, device: Device) {
    super(deviceModel, SegmentsStateName, []);
    device.state<PowerState>(PowerStateName)?.subscribe((event) => {
      if (event === undefined) {
        return;
      }
      this.on = event;
      if (!event || this.applyToWhole) {
        this.segments.forEach((segment) => {
          segment.on = event;
        });
        this.stateValue.next(this.segments);
      }
    });
    device.state(SegmentCountStateName)?.subscribe((event) => {
      if (
        event === undefined ||
        typeof event !== 'number' ||
        event === this.segments.length
      ) {
        return;
      }
      this.segments = this.segments.slice(0, event);
      new Array(event - this.segments.length).forEach(() =>
        this.segments.push({
          on: this.applyToWhole ? this.on : undefined,
          brightness: this.applyToWhole ? this.brightness : undefined,
        }),
      );
      this.stateValue.next(this.segments);
    });
    device.state<BrightnessState>(BrightnessStateName)?.subscribe((event) => {
      if (event === undefined) {
        return;
      }
      this.brightness = event;
      if (this.applyToWhole) {
        this.segments.forEach((segment) => {
          segment.brightness = event;
        });
        this.stateValue.next(this.segments);
      }
    });
    device.state<RGBICActiveState>(ModeStateName)?.subscribe((event) => {
      if (event === undefined) {
        return;
      }
      if (this.subscription !== undefined) {
        this.subscription.unsubscribe();
      }
      switch (event.name) {
        case WholeColorModeStateName:
          this.applyToWhole = true;
          this.subscription = (event as ColorModeState).subscribe((event) => {
            if (event === undefined || typeof event !== 'object') {
              return;
            }
            const color = event as Required<WholeColor>;
            if (!color) {
              return;
            }
            this.segments.forEach((segment) => {
              segment.on = this.on;
              segment.brightness = this.brightness;
              segment.color = color;
            });
            this.stateValue.next(this.segments);
          });
          break;
        case SegmentColorModeStateName:
          this.applyToWhole = false;
          this.subscription = (event as SegmentColorModeState).subscribe(
            (event) => {
              if (event === undefined || typeof event !== 'object') {
                return;
              }
              event.forEach((segment, i) => {
                if (i >= this.segments.length) {
                  this.segments.push({});
                }
                const hasColor =
                  (segment?.color?.red ?? 0) > 0 &&
                  (segment?.color?.green ?? 0) > 0 &&
                  (segment?.color?.blue ?? 0) > 0;
                this.segments[i].on = hasColor || (segment.brightness ?? 0) > 0;
                this.segments[i].brightness = segment.brightness;
                this.segments[i].color = segment.color;
              });
              this.stateValue.next(this.segments);
            },
          );
          break;
        default:
          this.applyToWhole = false;
          this.segments.forEach((segment) => {
            segment.on = false;
          });
          this.stateValue.next(this.segments);
      }
    });
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  parseState(data: unknown) {
    // no-op
  }
}
