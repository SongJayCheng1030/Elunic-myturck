import { BaseMessage, MeasurementMessage } from '../../model';
import { BasePipeline } from '../base-pipeline';

type Input = MeasurementMessage & BaseMessage;

interface Value {
  parameterId: string;
  value: number;
  unit?: string;
}

export interface Output {
  timestamp: Date;
  deviceId: string;
  outputs: Value[];
}

export class SeriesPipeline extends BasePipeline<Input, Output> {
  canTransform(input: Input): input is Input {
    return (
      super.canTransform(input) &&
      this.topicExtractor.extractMeasurementId(input.topic) === 'measurements'
    );
  }

  transformData(input: Input) {
    const outputs = [] as Value[];
    for (const [outerKey, outerValue] of Object.entries(input.measurements)) {
      for (const [innerKey, innerValue] of Object.entries(outerValue)) {
        outputs.push({
          parameterId: `${outerKey}/${innerKey}`,
          value: innerValue.value,
          unit: innerValue.unit,
        });
      }
    }

    return {
      timestamp: new Date(Math.floor(input.time * 1000)),
      deviceId: this.topicExtractor.extractDeviceId(input.topic),
      outputs,
    };
  }
}
