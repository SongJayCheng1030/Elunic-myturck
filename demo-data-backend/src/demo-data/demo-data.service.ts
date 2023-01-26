// @ts-ignore
import * as aliasSampling from '@apocentre/alias-sampling';
import { Logger } from '@elunic/logger';
import { InjectLogger } from '@elunic/logger-nestjs';
import { Injectable } from '@nestjs/common';
import * as gaussian from 'gaussian';
import * as ms from 'ms-typescript';

import { ConfigService } from '../config/config.service';
import {
  assets,
  ERROR_DISTRIBUTION,
  MACHINE_STATUS_DISTRIBUTION,
  measurments,
  products,
} from './definitions';
import { InfluxDbMachineDataWriter } from './machine-data-writer/influxdb-machine-data-writer';
import { Asset, DiscreteDistribution, MachineStatus, Product } from './types';

@Injectable()
export class DemoDataService {
  private writer = new InfluxDbMachineDataWriter(this.logger, this.config);

  private SWITCH_PRODUCT_INTERVAL_GAUSSIAN = gaussian(ms.toMs('8h'), ms.toMs('1h'));
  private SWITCH_MACHINE_STATUS_INTERVAL_GAUSSIAN = gaussian(ms.toMs('2h'), ms.toMs('0.25h'));
  private TICK_GENERATION_INTERVAL_MS = ms.toMs('1m');

  constructor(
    @InjectLogger('DemoDataService')
    private readonly logger: Logger,
    private readonly config: ConfigService,
  ) {}

  startProduction(): void {
    if (this.config.demoDataEnabled) {
      this.logger.info(`---------------`);
      this.logger.info(`-- Demo-Data Generator Start --`);
      this.logger.info(`---------------`);
      this.logger.info(`TICK_GENERATION_INTERVAL_MS ....: ${this.TICK_GENERATION_INTERVAL_MS} ms`);
      this.logger.info(`# assets .......................: ${assets.length}`);
      this.logger.info(`# products .....................: ${products.length}`);
      this.logger.info(`# measurments ..................: ${measurments.length}`);
      this.logger.info(`---------------`);

      this.switchProductPeriodically(this.sampleRandomArrayValue(products));

      for (const asset of assets) {
        this.switchMachineStatusPeriodically(asset, MachineStatus.PREPARATION);
        this.produceProductPeriodically(asset);

        this.setIntervalAsync(this.generateMachineTick_, this.TICK_GENERATION_INTERVAL_MS, asset);
      }
    }
  }

  sampleRandomArrayValue<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  sampleDiscreteDistribution(dist: DiscreteDistribution): number {
    const index = aliasSampling(dist.probabilities).next();
    return dist.values[index];
  }

  async generateMachineTick_(asset: Asset) {
    if (asset.product === null) {
      throw new Error(`Can't generate data: product is null`);
    }

    await this.writer.writePoint('machine_status', asset.status, {
      asset_id: asset.id,
      product_id: asset.product.id,
    });

    await this.writer.writePoint(
      'planned_products_per_hour',
      asset.product.plannedProductsPerHour,
      {
        asset_id: asset.id,
        product_id: asset.product.id,
      },
    );

    for (const measurement of measurments) {
      const value = measurement.gaussian.ppf(Math.random());
      await this.writer.writePoint(measurement.name, value, {
        asset_id: asset.id,
        product_id: asset.product.id,
      });
    }

    this.logger.debug(`Data generated.`);
  }

  async produceProductPeriodically(asset: Asset): Promise<void> {
    if (asset.product === null) throw new Error("Can't produce product: product is null");

    if (asset.status === MachineStatus.PRODUCTION) {
      if (Math.random() > asset.product.defectProbability) {
        await this.writer.writePoint('products_ok', 1, {
          asset_id: asset.id,
          product_id: asset.product.id,
        });
      } else {
        await this.writer.writePoint('products_nok', 1, {
          asset_id: asset.id,
          product_id: asset.product.id,
        });
      }
    }

    const nextProductionTimeoutMsec = asset.product.productionIntervalGaussian.ppf(Math.random());
    this.setTimeoutAsync(this.produceProductPeriodically, nextProductionTimeoutMsec, asset);
  }

  switchProductPeriodically(product: Product): void {
    for (const asset of assets) {
      asset.product = product; // NOTE: currently all assets are set to produce the same product
    }
    const nextProduct = this.sampleRandomArrayValue(products);
    const nextSwitchTimeoutMsec = this.SWITCH_PRODUCT_INTERVAL_GAUSSIAN.ppf(Math.random());
    setTimeout(
      this.switchProductPeriodically.bind(this, product),
      nextSwitchTimeoutMsec,
      nextProduct,
    );
  }

  async switchMachineStatusPeriodically(asset: Asset, status: MachineStatus): Promise<void> {
    if (asset.product === null) throw new Error("Can't switch machine status: product is null");

    if (asset.status !== MachineStatus.ERROR && status === MachineStatus.ERROR) {
      asset.error = this.sampleDiscreteDistribution(ERROR_DISTRIBUTION);
      await this.writer.writePoint('errors', 1, {
        asset_id: asset.id,
        product_id: asset.product.id,
        error_id: asset.error,
      });
    } else if (asset.status === MachineStatus.ERROR && status !== MachineStatus.ERROR) {
      if (!asset.error) throw new Error("Can't deactivate error: error is null");
      await this.writer.writePoint('errors', 0, {
        asset_id: asset.id,
        product_id: asset.product.id,
        error_id: asset.error,
      });
      asset.error = null;
    }

    asset.status = status;
    const nextStatus = this.sampleDiscreteDistribution(MACHINE_STATUS_DISTRIBUTION);
    const nextSwitchTimeoutMsec = this.SWITCH_MACHINE_STATUS_INTERVAL_GAUSSIAN.ppf(Math.random());
    this.setTimeoutAsync(
      this.switchMachineStatusPeriodically,
      nextSwitchTimeoutMsec,
      asset,
      nextStatus,
    );
  }

  // ---

  private setTimeoutAsync<T>(
    func: (...args: any[]) => Promise<T>,
    timeMsec: number,
    ...args: any[]
  ) {
    setTimeout(async () => {
      try {
        // @ts-ignore
        await func.apply<DemoDataService, any>(this, args);
      } catch (ex) {
        this.logger.error(`Error while executing timeout:`, ex);
        process.exit(1);
      }
    }, timeMsec);
  }

  private setIntervalAsync<T>(
    func: (...args: any[]) => Promise<T>,
    timeMsec: number,
    ...args: any[]
  ) {
    setInterval(async () => {
      try {
        // @ts-ignore
        await func.apply<DemoDataService, any>(this, args);
      } catch (ex) {
        this.logger.error(`Error while executing interval:`, ex);
      }
    }, timeMsec);
  }
}
