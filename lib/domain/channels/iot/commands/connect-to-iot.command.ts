import { Labelled } from '@constructorfleet/ultimate-govee/common';
import {
  IoTData,
  OnIoTMessageCallback,
} from '@constructorfleet/ultimate-govee/data';

export class ConnectToIoTCommand implements Labelled {
  label = 'Connect to IoT';
  constructor(
    readonly iotData: IoTData,
    readonly callback: OnIoTMessageCallback,
    readonly topic?: string,
    readonly deviceIds?: string[],
  ) {}
}
