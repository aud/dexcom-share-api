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

export interface GlucoseEntry {
  mgdl: number;
  mmol: number;
  trend: string; // TODO: Better types
  timestamp: number;
}
