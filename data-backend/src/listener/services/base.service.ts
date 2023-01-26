import { Logger } from '@nestjs/common';

import { BaseMessage, Input, TopicExtractor } from '../model';
import { CreatePointOptions, DatabaseService, Measurement } from './database.service';
import { Pipeline } from './pipeline';

export abstract class BaseService<TInput extends BaseMessage, TOutput> {
  abstract readonly name: Measurement;

  protected logger = new Logger(BaseService.name);

  constructor(
    protected database: DatabaseService,
    protected topicExtractor: TopicExtractor,
    private pipes: Array<Pipeline<TInput, TOutput>>,
  ) {}

  getDeviceId(topic: string): string {
    return this.topicExtractor.extractDeviceId(topic);
  }

  protected abstract handleInput(input: TInput, pipe: Pipeline<TInput>): Promise<boolean>;

  async init(): Promise<void> {
    return Promise.resolve();
  }

  async processMessage(input: TInput): Promise<boolean> {
    const result = await Promise.all(
      this.pipes.map(pipe =>
        this.handleInput(input, pipe).catch((err: Error) => {
          this.logger.error(`Error in ${this.name} handling input: ${JSON.stringify(input)}`);
          this.logger.error(err);
          return false;
        }),
      ),
    );
    // Message is handled successfully if at least one responses was positive.
    return result.includes(true) ? true : false;
  }

  getDefaultPoint(input: Input): Omit<CreatePointOptions, 'parameterId'> {
    const deviceId = this.topicExtractor.extractDeviceId(input.topic);
    return {
      measurement: this.name,
      timestamp: new Date(Math.floor(input.creationTime * 1000)),
      deviceId,
    };
  }
}
