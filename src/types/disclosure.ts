export interface Disclosure {
  source: string;
  transformation: string;
  timeWindow: string;
  n: number | null;
  totalMenciones?: number;
  missingRate?: number;
  note: string;
}

export interface IndicatorValue {
  value: number | string;
  n: number;
  source: string;
  transformation: string;
  timeWindow: string;
  missingRate?: number;
}
