import { Logger } from '@elunic/logger';

import { BaseMessage } from '../model';
import { BaseService } from '../services/base.service';

export abstract class Connector<T extends BaseMessage = BaseMessage> {
  private listening = false;
  private services = new Set<BaseService<T, unknown>>();

  protected abstract init(): Promise<void>;
  protected abstract listen(): Promise<void>;
  protected abstract unlisten(): Promise<void>;

  constructor(protected logger: Logger) {}

  addService(service: BaseService<T, unknown>): void {
    this.services.add(service);
  }

  getServices(): Array<BaseService<T, unknown>> {
    return Array.from(this.services);
  }

  async start(): Promise<void> {
    if (!this.listening) {
      try {
        await this.init();
      } catch (e) {
        this.logger.error(`Could not init service`, e);
        throw e;
      }
      await Promise.all(this.getServices().map(service => service.init()));
      await this.listen();
      this.listening = true;
    }
  }

  async stop(): Promise<void> {
    if (this.listening) {
      await this.unlisten();
      this.listening = false;
    }
  }

  protected async processMessage(data: T): Promise<void> {
    const result = await Promise.all(
      this.getServices().map(service => service.processMessage(data)),
    );
    if (!result.includes(true)) {
      this.logger.warn(`Could not handle message: ${JSON.stringify(data)}`);
    }
  }

  protected logError(err: unknown, type: 'error' | 'warn' = 'error') {
    this.logger[type](err);
    if (err instanceof Error) {
      this.logger[type](err.name, err.message, err.stack);
    }
  }
}
