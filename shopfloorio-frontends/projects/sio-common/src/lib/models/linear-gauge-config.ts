export interface LinearGaugeConfig {
  label: string;
  min: number;
  max: number;
  warning: number;
  error: number | null;
  amountDecimals?: number;
  unit?: string;
}
