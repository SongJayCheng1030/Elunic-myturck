import { Injectable } from '@nestjs/common';

import { Input, TopicExtractor } from '../../model';
import { BaseService } from '../base.service';
import { DatabaseService } from '../database.service';
import { Pipeline } from '../pipeline';
import { Output, SeriesPipeline } from './series.pipeline';

@Injectable()
export class SeriesService extends BaseService<Input, Output> {
  readonly name = 'series';

  constructor(database: DatabaseService, topicExtractor: TopicExtractor) {
    super(database, topicExtractor, [new SeriesPipeline(topicExtractor)]);
  }

  protected async handleInput(input: Input, pipe: Pipeline<Input, Output>): Promise<boolean> {
    const output = pipe.transform(input);

    if (output) {
      this.addMeasurement(input, output);
      return true;
    }
    return false;
  }

  protected addMeasurement(input: Input, output: Output) {
    for (const value of output.outputs) {
      this.database.writeMeasurementPoint(
        { ...this.getDefaultPoint(input), parameterId: value.parameterId },
        [
          {
            name: 'value',
            value: value.value,
            type: 'float',
          },
          {
            name: 'unit',
            value: value.unit,
            type: 'string',
          },
        ],
      );
    }
  }
}
