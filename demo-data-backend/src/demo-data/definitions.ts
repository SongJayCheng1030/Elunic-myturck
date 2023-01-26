import * as ms from 'ms-typescript';

import { Asset, DiscreteDistribution, MachineStatus, Measurement, Product } from './types';
import gaussian = require('gaussian');

export const MACHINE_STATUS_DISTRIBUTION: DiscreteDistribution = {
  values: Object.values(MachineStatus).filter(v => !isNaN(Number(v))) as number[],
  probabilities: [0.1, 0.65, 0.1, 0.05, 0.05, 0.05],
};

export const ERROR_DISTRIBUTION: DiscreteDistribution = {
  values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  probabilities: [0.4, 0.2, 0.1, 0.08, 0.07, 0.06, 0.05, 0.02, 0.01, 0.01],
};

export const assets: Asset[] = [
  {
    id: 1,
    status: MachineStatus.OFFLINE,
    product: null,
    error: null,
  },
  {
    id: 2,
    status: MachineStatus.OFFLINE,
    product: null,
    error: null,
  },
  {
    id: 3,
    status: MachineStatus.OFFLINE,
    product: null,
    error: null,
  },
  {
    id: 4,
    status: MachineStatus.OFFLINE,
    product: null,
    error: null,
  },
  {
    id: 5,
    status: MachineStatus.OFFLINE,
    product: null,
    error: null,
  },
];

export const products: Product[] = [
  {
    id: 1,
    plannedProductsPerHour: 3600,
    productionIntervalGaussian: gaussian(ms.toMs('1s'), ms.toMs('0.023s')), // ~0.5-1.5s
    defectProbability: 0.03,
  },
  {
    id: 2,
    plannedProductsPerHour: 5400,
    productionIntervalGaussian: gaussian(ms.toMs('1.5s'), ms.toMs('0.023s')), // ~1.0-2.0s
    defectProbability: 0.02,
  },
  {
    id: 3,
    plannedProductsPerHour: 7200,
    productionIntervalGaussian: gaussian(ms.toMs('2.0s'), ms.toMs('0.023s')), // ~1.5-2.5s
    defectProbability: 0.01,
  },
];

export const measurments: Measurement[] = [
  {
    name: 'power',
    gaussian: gaussian(150, 256), // ~100-200
  },
  {
    name: 'compressed_air',
    gaussian: gaussian(35, 2.56), // ~30-40
  },
  {
    name: 'water',
    gaussian: gaussian(10, 2.56), // ~5-15
  },
];
