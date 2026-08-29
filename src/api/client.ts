import { useQuery, useMutation } from '@tanstack/react-query';
import {
  DashboardSnapshot,
  AlertsResponse,
  NowcastLiveResponse,
  ForecastResponse,
  RisksResponse,
  MarketResponse,
  Location,
  ChatRequest,
  ChatResponse,
  GeoSearchResponse,
  BootstrapResponse,
} from '../types';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'https://rituchakra-api.onrender.com';
const DEFAULT_LAT = Number(process.env.EXPO_PUBLIC_DEFAULT_LAT) || 22.0667;
const DEFAULT_LON = Number(process.env.EXPO_PUBLIC_DEFAULT_LON) || 88.0698;

// ---------------------------------------------------------------------------
// Track data source for UI banners
// ---------------------------------------------------------------------------
export let lastDataSource: 'live' | 'fallback' | 'error' = 'live';

// ---------------------------------------------------------------------------
// Core fetcher — 8s timeout + JSON parse
// ---------------------------------------------------------------------------
async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  try {
    const res = await Promise.race([
      fetch(url, {
        headers: {
          'Accept': 'application/json',
          ...(options?.headers || {}),
        },
        ...options,
      }),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout (30s)')), 30000)
      ),
    ]);
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    lastDataSource = 'live';
    return res.json();
  } catch (err) {
    console.error('apiFetch error for', url, ':', err);
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Location query builder
// ---------------------------------------------------------------------------
function locQuery(lat?: number, lon?: number): string {
  const la = lat ?? DEFAULT_LAT;
  const lo = lon ?? DEFAULT_LON;
  return `place=Haldia&lat=${la}&lon=${lo}`;
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

export async function getBootstrap(): Promise<BootstrapResponse> {
  return apiFetch<BootstrapResponse>('/api/bootstrap');
}

export async function getDashboard(lat?: number, lon?: number): Promise<DashboardSnapshot> {
  return apiFetch<DashboardSnapshot>(`/api/dashboard?${locQuery(lat, lon)}`);
}

export async function getAlerts(lat?: number, lon?: number): Promise<AlertsResponse> {
  return apiFetch<AlertsResponse>(`/api/alerts?${locQuery(lat, lon)}`);
}

export async function getNowcastLive(lat?: number, lon?: number): Promise<NowcastLiveResponse> {
  return apiFetch<NowcastLiveResponse>(`/api/nowcast/live?${locQuery(lat, lon)}`);
}

export async function getForecast(lat?: number, lon?: number): Promise<ForecastResponse> {
  return apiFetch<ForecastResponse>(`/api/forecast?${locQuery(lat, lon)}`);
}

export async function getRisks(lat?: number, lon?: number): Promise<RisksResponse> {
  return apiFetch<RisksResponse>(`/api/risks?${locQuery(lat, lon)}`);
}

export async function getMarket(lat?: number, lon?: number): Promise<MarketResponse> {
  return apiFetch<MarketResponse>(`/api/market?${locQuery(lat, lon)}`);
}

export async function searchGeo(query: string): Promise<Location[]> {
  const data = await apiFetch<GeoSearchResponse>(`/api/geo/search?q=${encodeURIComponent(query)}`);
  return data.results || [];
}

export async function postChat(body: ChatRequest): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ---------------------------------------------------------------------------
// TanStack Query Hooks
// ---------------------------------------------------------------------------

export function useBootstrap() {
  return useQuery({
    queryKey: ['bootstrap'],
    queryFn: getBootstrap,
    staleTime: 600_000, // 10 min
    retry: 2,
  });
}

export function useDashboard(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['dashboard', lat, lon],
    queryFn: () => getDashboard(lat, lon),
    staleTime: 60_000,
    retry: 2,
  });
}

export function useAlerts(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['alerts', lat, lon],
    queryFn: () => getAlerts(lat, lon),
    staleTime: 60_000,
    retry: 2,
  });
}

export function useNowcastLive(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['nowcast-live', lat, lon],
    queryFn: () => getNowcastLive(lat, lon),
    staleTime: 30_000,
    refetchInterval: 60_000, // poll every 60s per API docs
    retry: 2,
  });
}

export function useForecastData(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['forecast', lat, lon],
    queryFn: () => getForecast(lat, lon),
    staleTime: 300_000,
    retry: 2,
  });
}

export function useRisks(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['risks', lat, lon],
    queryFn: () => getRisks(lat, lon),
    staleTime: 300_000,
    retry: 2,
  });
}

export function useMarket(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['market', lat, lon],
    queryFn: () => getMarket(lat, lon),
    staleTime: 300_000,
    retry: 2,
  });
}

export function useGeoSearch(query: string) {
  return useQuery({
    queryKey: ['geoSearch', query],
    queryFn: () => searchGeo(query),
    enabled: query.length > 2,
    retry: 1,
  });
}

export function useChatMutation() {
  return useMutation({
    mutationFn: postChat,
  });
}
