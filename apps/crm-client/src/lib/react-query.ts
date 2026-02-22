import { QueryClient, MutationCache } from '@tanstack/react-query';
import { get, set, del } from 'idb-keyval';
import { PersistedClient, Persister } from '@tanstack/react-query-persist-client';

// TITANIUM: OFFLINE PERSISTENCE ENGINE (INDEXED DB)
// This ensures the app works perfectly without internet, persisting cache to disk.
export const createIDBPersister = (
  idbValidKey: IDBValidKey = 'TITANIUM_OFFLINE_CACHE',
): Persister => ({
  persistClient: async (client: PersistedClient) => {
    try {
      await set(idbValidKey, client);
    } catch {
      // Silent fail — offline cache write is non-critical
    }
  },
  restoreClient: async () => {
    try {
      return await get<PersistedClient>(idbValidKey);
    } catch {
      return undefined;
    }
  },
  removeClient: async () => {
    await del(idbValidKey);
  },
});

export const persister = createIDBPersister();

export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      // Dispatch event for UI to pick up (Toast/ErrorBoundary)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('titanium-error', { detail: error }));
      }
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes (Titanium Standard: Low Volatility by Default)
      gcTime: 1000 * 60 * 60 * 24, // 24 HOURS (Bunker Mode) - Keep data in memory/disk for a full day
      retry: 2, // TITANIUM RESILIENCE: 2 Retries (Exponential Backoff Default)
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Smart Backoff
      refetchOnWindowFocus: false, // Save Firebase reads
      networkMode: 'offlineFirst',
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 0, // Mutations should not retry automatically by default (risk of double-writes if not idempotent)
    },
  },
});
