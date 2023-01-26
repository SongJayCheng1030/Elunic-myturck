import * as gaussian from 'gaussian';

export enum MachineStatus {
  OFFLINE,
  PRODUCTION,
  ERROR,
  MAINTENANCE,
  PREPARATION,
  CLEANING,
}

export interface Product {
  id: number;
  plannedProductsPerHour: number;
  productionIntervalGaussian: gaussian.Gaussian;
  defectProbability: number;
}

export interface Asset {
  id: number;
  status: MachineStatus;
  product: Product | null;
  error: number | null;
}

export interface Measurement {
  name: string;
  gaussian: gaussian.Gaussian;
}

export interface DiscreteDistribution {
  values: number[];
  probabilities: number[];
}
