import { Injectable } from '@nestjs/common';

import { Topic } from './types';

//
// Examples of a topic:
//     0            1                2
//    c8y    / [Device-ID] / [Measurement-Type]
//

@Injectable()
export class TopicExtractor {
  extractDeviceId(topic: string): string {
    return this.extractAt(topic, 1);
  }

  extractMeasurementId(topic: string): Topic {
    return this.extractAt(topic, 2) as Topic;
  }

  normalize(str: string): string {
    return str.replace(/(\s|\|)/g, '_');
  }

  private extractAt(topic: string, index: number): string {
    const str = topic.split('/')[index].replace(/ /g, '-');
    return this.normalize(str);
  }
}
