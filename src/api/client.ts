import { useQuery } from '@tanstack/react-query';
import { 
  DashboardSnapshot, 
  AnalyticsSnapshot, 
  MarketPrice, 
  DailyForecast,
  GeoLocation
} from '../types';
import { mockDashboard } from '../mocks/dashboard.mock';
import { mockAnalytics } from '../mocks/analytics.mock';
import { mockMarketPrices } from '../mocks/market.mock';
import { mockForecast } from '../mocks/forecast.mock';
import { mockGeoLocations } from '../mocks/geo.mock';

const API_BASE = process.env.EXPO_PUBLIC_API_BASE;
const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

// ---------------------------------------------------------------------------
// Helper: try real fetch, fall back to mock on any failure
// ---------------------------------------------------------------------------
async function fetchWithFallback<T>(
  url: string,
  fallback: T,
): Promise<{ data: T; source: 'live' | 'fallback' }> {
  try {
    const res = await Promise.race([
      fetch(url),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error('Timeout')), 2000))
    ]);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { data, source: 'live' };
  } catch (err) {
    console.warn(`[Rituchakra] fetch failed (${url}), using fallback data:`, err);
    return { data: fallback, source: 'fallback' };
  }
}

// Track whether we're on live or fallback data (screens can show a banner)
export let lastDataSource: 'live' | 'fallback' | 'mock' = 'mock';

// ---------------------------------------------------------------------------
// API Client Functions
// ---------------------------------------------------------------------------

export async function getDashboard(lat?: number, lon?: number): Promise<DashboardSnapshot> {
  if (USE_MOCKS) { lastDataSource = 'mock'; return mockDashboard; }
  const { data, source } = await fetchWithFallback<DashboardSnapshot>(
    `${API_BASE}/api/dashboard?lat=${lat}&lon=${lon}`,
    mockDashboard
  );
  lastDataSource = source;
  return data;
}

export async function getAnalytics(lat?: number, lon?: number): Promise<AnalyticsSnapshot> {
  if (USE_MOCKS) { lastDataSource = 'mock'; return mockAnalytics; }
  const { data, source } = await fetchWithFallback<AnalyticsSnapshot>(
    `${API_BASE}/api/nowcast?lat=${lat}&lon=${lon}`,
    mockAnalytics
  );
  lastDataSource = source;
  return data;
}

export async function getMarketPrices(): Promise<MarketPrice[]> {
  if (USE_MOCKS) { lastDataSource = 'mock'; return mockMarketPrices; }
  const { data, source } = await fetchWithFallback<MarketPrice[]>(
    `${API_BASE}/api/market`,
    mockMarketPrices
  );
  lastDataSource = source;
  return data;
}

export async function getForecast(lat?: number, lon?: number): Promise<DailyForecast[]> {
  if (USE_MOCKS) { lastDataSource = 'mock'; return mockForecast; }
  const { data, source } = await fetchWithFallback<DailyForecast[]>(
    `${API_BASE}/api/forecast?lat=${lat}&lon=${lon}`,
    mockForecast
  );
  lastDataSource = source;
  return data;
}

export async function searchGeo(query: string): Promise<GeoLocation[]> {
  if (USE_MOCKS) {
    lastDataSource = 'mock';
    return mockGeoLocations.filter(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  const { data, source } = await fetchWithFallback<GeoLocation[]>(
    `${API_BASE}/api/geo/search?q=${query}`,
    mockGeoLocations.filter(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase())
    )
  );
  lastDataSource = source;
  return data;
}

// ---------------------------------------------------------------------------
// TanStack Query Hooks
// ---------------------------------------------------------------------------

export function useDashboard(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['dashboard', lat, lon],
    queryFn: () => getDashboard(lat, lon),
    placeholderData: mockDashboard,     // show mock instantly while fetching
    retry: 1,                           // one retry before giving up
    staleTime: 60_000,                  // 1 min before refetch
  });
}

export function useAnalytics(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['analytics', lat, lon],
    queryFn: () => getAnalytics(lat, lon),
    placeholderData: mockAnalytics,
    retry: 1,
    staleTime: 30_000,
  });
}

export function useMarketPrices() {
  return useQuery({
    queryKey: ['marketPrices'],
    queryFn: () => getMarketPrices(),
    placeholderData: mockMarketPrices,
    retry: 1,
    staleTime: 300_000,                 // 5 min — prices don't change fast
  });
}

export function useForecastData(lat?: number, lon?: number) {
  return useQuery({
    queryKey: ['forecast', lat, lon],
    queryFn: () => getForecast(lat, lon),
    placeholderData: mockForecast,
    retry: 1,
    staleTime: 300_000,
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
