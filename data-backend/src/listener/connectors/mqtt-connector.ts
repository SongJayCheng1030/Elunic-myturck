import { Logger } from '@elunic/logger';
import { Injectable } from '@nestjs/common';
import { AsyncClient, connect } from 'async-mqtt';

import { ConfigService } from '../../config/config.service';
import { Input } from '../model';
import { Connector } from './connector';

@Injectable()
export class MqttConnector extends Connector<Input> {
  private client!: AsyncClient;

  constructor(private config: ConfigService, logger: Logger) {
    super(logger);
  }

  protected init(): Promise<void> {
    const { mqtt } = this.config;
    this.client = connect({
      protocol: mqtt.port,
      host: 'rabbit.myturck-dev.elunic.software',
      port: 9883,
      username: 'app',
      password: 'CD9JRW93U9TFl0qwRPxOTr34EtT1ARvd',
    });
    return new Promise((resolve, reject) => {
      this.client.once('connect', resolve);
      this.client.once('error', reject);
    });
  }

  async listen(): Promise<void> {
    if (!this.client) {
      return;
    }
    await this.client.subscribe('#');
    this.client.on('message', (topic, payload) => this.handleMessage(topic, payload));
  }

  async unlisten(): Promise<void> {
    if (!this.client) {
      return;
    }
    await this.client.unsubscribe('#');
    return this.client.end();
  }

  private async handleMessage(topic: string, payload: Buffer): Promise<void> {
    try {
      const data = JSON.parse(payload.toString());
      await this.processMessage({ ...data, topic });
    } catch (e) {
      this.logError(e);
    }
  }
}
