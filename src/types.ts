// In Dexcom terms, "eu" means everywhere not in the US.
export type DexcomServer = "eu" | "us";

export interface ConfigurationProps {
  username: string;
  password: string;
  server: DexcomServer;
}

export interface LatestGlucoseProps {
  minutes: number;
  maxCount: number;
}

// Raw Dexcom response:
//
// {
//   WT: 'Date(1640812425000)',         => Wall time
//   ST: 'Date(1640812425000)',         => System time
//   DT: 'Date(1640812425000-0500)',    => Display time
//   Value: 185,                        => mg/dL
//   Trend: 'Flat'                      => Trend. Previously this was expressed as (1 = max raise, 7 = max drop)
// }
export interface DexcomEntry {
  WT: string;
  ST: string;
  DT: string;
  Value: number;
  Trend: string;
}

export enum Trend {
  DoubleUp,
  SingleUp,
  FortyFiveUp,
  Flat,
  FortyFiveDown,
  SingleDown,
  DoubleDown
}

export interface GlucoseEntry {
  mgdl: number;
  mmol: number;
  // https://s3-us-west-2.amazonaws.com/dexcompdf/HCP_Website/LBL014261+G5+NA+advanced+treatment+decisions.pdf
  trend: Trend;
  timestamp: number;
}
