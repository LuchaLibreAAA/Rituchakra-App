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

import { useLocation } from '../context/LocationContext';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'https://rituchakra-api.onrender.com';

// ---------------------------------------------------------------------------
// Track data source for UI banners
// ---------------------------------------------------------------------------
export let lastDataSource: 'live' | 'fallback' | 'error' = 'live';

interface ApiFetchOptions extends RequestInit {
  timeout?: number;
}

// ---------------------------------------------------------------------------
// Core fetcher
// ---------------------------------------------------------------------------
async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const timeoutMs = options?.timeout || 30000;
  
  try {
    const res = await Promise.race([
      fetch(url, {
        ...options,
        headers: {
          'Accept': 'application/json',
          ...(options?.headers || {}),
        },
      }),
      new Promise<Response>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout (${timeoutMs}ms)`)), timeoutMs)
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
function locQuery(loc: Location): string {
  const params: string[] = [];
  if (loc.district) params.push(`district=${encodeURIComponent(loc.district)}`);
  const place = loc.place_name || loc.label.split(',')[0];
  if (place) params.push(`place=${encodeURIComponent(place)}`);
  if (loc.lat !== undefined) params.push(`lat=${loc.lat}`);
  if (loc.lon !== undefined) params.push(`lon=${loc.lon}`);
  return params.join('&');
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

export async function getBootstrap(): Promise<BootstrapResponse> {
  return apiFetch<BootstrapResponse>('/app/v1/bootstrap');
}

export async function getDashboard(loc: Location): Promise<DashboardSnapshot> {
  return apiFetch<DashboardSnapshot>(`/app/v1/dashboard?${locQuery(loc)}`);
}

export async function getAlerts(loc: Location): Promise<AlertsResponse> {
  return apiFetch<AlertsResponse>(`/app/v1/alerts?${locQuery(loc)}`);
}

export async function getNowcastLive(loc: Location): Promise<NowcastLiveResponse> {
  return apiFetch<NowcastLiveResponse>(`/app/v1/nowcast/live?${locQuery(loc)}`);
}

export async function getForecast(loc: Location): Promise<ForecastResponse> {
  return apiFetch<ForecastResponse>(`/app/v1/forecast?${locQuery(loc)}`);
}

export async function getRisks(loc: Location): Promise<RisksResponse> {
  return apiFetch<RisksResponse>(`/app/v1/risks?${locQuery(loc)}`);
}

export async function getMarket(loc: Location): Promise<MarketResponse> {
  return apiFetch<MarketResponse>(`/app/v1/market?${locQuery(loc)}`);
}

export async function searchGeo(query: string): Promise<Location[]> {
  const data = await apiFetch<GeoSearchResponse>(`/app/v1/geo/search?q=${encodeURIComponent(query)}`);
  return data.results || [];
}

export async function postChat(body: ChatRequest): Promise<ChatResponse> {
  return apiFetch<ChatResponse>('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    timeout: 500000,
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

export function useDashboard() {
  const { location } = useLocation();
  return useQuery({
    queryKey: ['dashboard', location.lat, location.lon],
    queryFn: () => getDashboard(location),
    staleTime: 60_000,
    retry: 2,
  });
}

export function useAlerts() {
  const { location } = useLocation();
  return useQuery({
    queryKey: ['alerts', location.lat, location.lon],
    queryFn: () => getAlerts(location),
    staleTime: 60_000,
    retry: 2,
  });
}

export function useNowcastLive() {
  const { location } = useLocation();
  return useQuery({
    queryKey: ['nowcast-live', location.lat, location.lon],
    queryFn: () => getNowcastLive(location),
    staleTime: 30_000,
    refetchInterval: 60_000, // poll every 60s per API docs
    retry: 2,
  });
}

export function useForecastData() {
  const { location } = useLocation();
  return useQuery({
    queryKey: ['forecast', location.lat, location.lon],
    queryFn: () => getForecast(location),
    staleTime: 300_000,
    retry: 2,
  });
}

export function useRisks() {
  const { location } = useLocation();
  return useQuery({
    queryKey: ['risks', location.lat, location.lon],
    queryFn: () => getRisks(location),
    staleTime: 300_000,
    retry: 2,
  });
}

export function useMarket() {
  const { location } = useLocation();
  return useQuery({
    queryKey: ['market', location.lat, location.lon],
    queryFn: () => getMarket(location),
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
