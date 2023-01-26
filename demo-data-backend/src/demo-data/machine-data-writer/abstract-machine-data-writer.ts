export abstract class AbstractMachineDataWriter {
  abstract writePoint(
    measurement: string,
    value: number,
    tags: { [key: string]: number },
  ): Promise<void>;
}
