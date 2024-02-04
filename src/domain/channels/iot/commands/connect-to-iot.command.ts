import { Labelled } from '@govee/common';
import { IoTData, OnIoTMessageCallback } from '@govee/data';

export class ConnectToIoTCommand implements Labelled {
  label = 'Connect to IoT';
  constructor(
    readonly iotData: IoTData,
    readonly callback: OnIoTMessageCallback,
    readonly topic?: string,
  ) {}
}
