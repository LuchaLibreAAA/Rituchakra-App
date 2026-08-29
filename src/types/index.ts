// ---------------------------------------------------------------------------
// Location — returned by every endpoint
// ---------------------------------------------------------------------------
export interface Location {
  id: string;
  label: string;
  country: string;
  state: string;
  district: string;
  lat: number;
  lon: number;
  timezone: string;
  crop_hint?: string;
  season_hint?: string;
  plot_m2?: number;
  place_kind: string;
  place_name: string;
}

// ---------------------------------------------------------------------------
// Bootstrap — GET /api/bootstrap
// ---------------------------------------------------------------------------
export interface BootstrapResponse {
  ok: boolean;
  version: string;
  default_location: Location;
  locales: string[];
  tabs: string[];
  capabilities: {
    sse_chat: boolean;
    json_chat: boolean;
    storm_map: boolean;
    nowcast_live: boolean;
    geo_india_only: boolean;
  };
}

// ---------------------------------------------------------------------------
// Time-series data point (used across many endpoints)
// ---------------------------------------------------------------------------
export interface TimeSeriesPoint {
  t: string;
  value: number;
  unit: string;
  source: string;
  quality: string;
}

// ---------------------------------------------------------------------------
// Dashboard — GET /api/dashboard (large, we use slices)
// ---------------------------------------------------------------------------
export interface DashboardCurrent {
  temp_c: number;
  precip_1h_mm: number;
  humidity_pct: number;
  wind_ms: number;
  wind_compass: string;
  soil_moisture_m3m3: number;
  et0_mm: number;
  cloud_cover_pct: number;
  sky_label: string;
  sky_kind: string;
  is_day: boolean;
  om_us_aqi: number | null;
  om_pm25: number | null;
  wave_height_m: number | null;
  wave_compass: string | null;
  sst_c: number | null;
  uv_index: number;
}

export interface DashboardSeries {
  precip_hourly: TimeSeriesPoint[];
  temp_hourly: TimeSeriesPoint[];
  soil_hourly: TimeSeriesPoint[];
  discharge_daily: TimeSeriesPoint[];
  [key: string]: TimeSeriesPoint[];
}

export interface DiagnosticStory {
  id: string;
  title: string;
  why: string;
  evidence: string;
  implication: string;
}

export interface OutlookDay {
  date: string;
  precip_mm: number;
  precip_prob_pct: number;
  temp_max_c: number;
  temp_min_c: number;
  et0_mm: number;
  soil_m3m3: number;
  water_balance_mm: number;
  irrigate: boolean;
  flood_watch: boolean;
  confidence_pct: number;
  adjustment?: string;
}

export interface DashboardPredictive {
  precip_7d_mm: number;
  water_balance_7d_mm: number;
  et0_7d_mm: number;
  flood_discharge_trend: string;
  river_discharge: number[];
  irrigate_dates: string[];
  flood_watch_dates: string[];
  outlook_days: OutlookDay[];
}

export interface DashboardSnapshot {
  location: Location;
  generated_at: string;
  sources: string[];
  descriptive: {
    current: DashboardCurrent;
    series: DashboardSeries;
  };
  diagnostic: {
    stories: DiagnosticStory[];
  };
  predictive: DashboardPredictive;
  prescriptive: {
    warnings: Warning[];
    actions: PrescriptiveAction[];
  };
  risks: Risk[];
  ogd?: any;
  map?: any;
}

// ---------------------------------------------------------------------------
// Warnings & Actions — GET /api/alerts
// ---------------------------------------------------------------------------
export interface Warning {
  id: string;
  severity: string;
  title: string;
  body: string;
  source: string;
  hazard: string;
  issued_at?: string | null;
  distance_km?: number | null;
}

export interface PrescriptiveAction {
  id: string;
  priority: number;
  action: string;
  why: string;
  when: string;
  who: string;
  confidence_pct: number;
  slots?: Record<string, any>;
}

export interface Quake {
  id: string;
  mag: number;
  place: string;
  time_iso: string;
  lat: number;
  lon: number;
  depth_km: number;
  distance_km: number;
  tsunami_flag: boolean;
}

export interface AlertsResponse {
  location: Location;
  generated_at: string;
  warnings: Warning[];
  actions: PrescriptiveAction[];
  quakes: Quake[];
  tsunami: any[];
  air: any;
  flood: {
    discharge: number[];
    trend: string;
    score_pct: number;
    source: string;
  };
}

// ---------------------------------------------------------------------------
// Risks — GET /api/risks
// ---------------------------------------------------------------------------
export interface RiskFactor {
  id: string;
  label: string;
  contribution_pct: number;
}

export interface Risk {
  id: string;
  label: string;
  severity: string;
  score_pct: number;
  confidence_pct: number;
  horizon_hours: number;
  factors: RiskFactor[];
  method: string;
  sources: string[];
}

export interface RisksResponse {
  location: Location;
  risks: Risk[];
}

// ---------------------------------------------------------------------------
// Nowcast Live — GET /api/nowcast/live  (poll every 60s)
// ---------------------------------------------------------------------------
export interface NowcastKnot {
  t: string;
  lead_h: number;
  mm: number;
  p_wet: number;
  engine: string;
}

export interface NowcastObserved {
  t: string;
  mm: number;
  engine: string;
}

export interface NowcastPlayhead {
  t: string;
  seconds_to_onset: number;
  tide_m: number;
  pond_mm: number;
  gap_mm_h: number;
  pump: string;
  enterable: boolean;
}

export interface ConvectiveLevel {
  level: string;
  score_pct: number;
}

export interface NowcastLocked {
  hours: NowcastKnot[];
  onset: string | null;
  cessation: string | null;
  kal_level: string;
  regime: string;
  fluvial: boolean;
  pluvial: boolean;
  convective: {
    lightning: ConvectiveLevel;
    cloudburst: ConvectiveLevel;
    downburst: ConvectiveLevel;
  };
}

export interface KalmanSat {
  playhead_rate: number;
  last_error_mm_h: number;
  n_updates: number;
  next_obs_eta_s: number;
  obs_knots: NowcastObserved[];
  history: {
    scenes: Array<{
      t: string;
      obs: number;
      pred: number;
      y: number;
      after: number;
    }>;
    mae: number;
    n: number;
  };
}

export interface NowcastLiveResponse {
  location: Location;
  as_of: string;
  knots: NowcastKnot[];
  observed: NowcastObserved[];
  playhead: NowcastPlayhead;
  locked: NowcastLocked;
  sat: KalmanSat;
  convective: {
    lightning: ConvectiveLevel;
    cloudburst: ConvectiveLevel;
    downburst: ConvectiveLevel;
  };
  actions: PrescriptiveAction[];
}

// ---------------------------------------------------------------------------
// Forecast — GET /api/forecast
// ---------------------------------------------------------------------------
export interface ForecastResponse {
  location: Location;
  predictive: DashboardPredictive;
  descriptive: {
    current: DashboardCurrent;
    series: DashboardSeries;
  };
  sources: string[];
}

// ---------------------------------------------------------------------------
// Market — GET /api/market
// ---------------------------------------------------------------------------
export interface MarketResponse {
  location: Location;
  generated_at: string;
  ogd: {
    mandi: any[];
    nearby: Location[];
    quakes: Quake[];
  };
}

// ---------------------------------------------------------------------------
// Geo — GET /api/geo/search
// ---------------------------------------------------------------------------
export interface GeoSearchResponse {
  results: Location[];
}

// ---------------------------------------------------------------------------
// Chat — POST /api/chat
// ---------------------------------------------------------------------------
export interface ChatRequest {
  message: string;
  locale_hint: string;
  output_locale: string;
  location?: Partial<Location>;
  history?: ChatHistoryEntry[];
  regenerate?: boolean;
  stream: false;
}

export interface ChatHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatMessage {
  id: string;
  role: string;
  content: string;
  content_en?: string;
  locale?: string;
  blocks?: any[];
  suggestions?: string[];
  citations?: any[];
}

export interface ChatResponse {
  ok: boolean;
  stream: false;
  events: any[];
  message: ChatMessage;
}
