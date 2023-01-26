import { Client } from '@c8y/client';
import { Logger } from '@elunic/logger';
import { Injectable } from '@nestjs/common';

import { ConfigService } from '../../config/config.service';
import { Input, Measurements, Value } from '../model';
import { Connector } from './connector';

// C8y includes default properties and the measurement itself in one object.
// These props are default props sent by c8y that are just metadata.
const IGNORED_PROPS = ['self', 'time', 'id', 'source', 'type'];

@Injectable()
export class C8yConnector extends Connector<Input> {
  private client!: Client;
  private sub?: object;

  constructor(private config: ConfigService, logger: Logger) {
    super(logger);
  }

  protected async init(): Promise<void> {
    const { user, password, baseUrl } = this.config.cumulocity;
    this.client = await Client.authenticate({ user, password }, baseUrl);
  }

  async listen(): Promise<void> {
    if (!this.client) {
      return;
    }

    this.sub = this.client.realtime.subscribe('/measurements/*', async m => {
      const data = m.data.data;
      if (data.type !== 'c8y_Measurement') {
        return;
      }

      const time = Math.floor(new Date(data.time).getTime() / 1000);
      // Convert realtime API response to compatible payload.
      const deviceId = m.channel.replace('/measurements/', '').trim();
      try {
        await this.processMessage({
          topic: `c8y/${deviceId}/measurements`,
          id: m.id,
          source: data.source.id,
          time,
          creationTime: time,
          measurements: Object.entries(data).reduce((prev, [key, value]) => {
            if (!IGNORED_PROPS.includes(key)) {
              return { ...prev, [key]: value as Record<string, Value> };
            }
            return prev;
          }, {} as Measurements),
          ...m,
        });
      } catch (e) {
        this.logError(e);
      }
    });
  }

  async unlisten(): Promise<void> {
    if (!this.client || !this.sub) {
      return;
    }
    this.client.realtime.unsubscribe(this.sub);
  }
}
