export interface LoginProps {
  username: string;
  password: string;
}

export interface LatestGloucoseProps {
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

export interface GloucoseEntry {
  mgdl: number;
  mmol: number;
  trend: string; // TODO: Better types
  timestamp: number;
}
