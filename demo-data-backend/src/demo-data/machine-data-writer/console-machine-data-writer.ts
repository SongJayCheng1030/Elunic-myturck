import { AbstractMachineDataWriter } from './abstract-machine-data-writer';

export class ConsoleMachineDataWriter extends AbstractMachineDataWriter {
  async writePoint(
    measurement: string,
    value: number,
    tags: { [key: string]: number },
  ): Promise<void> {
    // eslint-disable-next-line no-console
    console.log(measurement, value, JSON.stringify(tags));
  }
}
