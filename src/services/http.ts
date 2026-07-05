import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

type RetryOptions = {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  dedupeKey?: string;
  dedupe?: boolean;
  cache?: boolean;
  cacheTtlMs?: number;
};

const inflightGets = new Map<string, Promise<unknown>>();
const responseCache = new Map<string, { data: unknown; timestamp: number }>();
const DEFAULT_CACHE_TTL_MS = 30_000;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const seconds = Number.parseInt(value, 10);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const dateMs = Date.parse(value);
  if (!Number.isNaN(dateMs)) return Math.max(0, dateMs - Date.now());
  return null;
}

function getAuthHeaderValue(config?: AxiosRequestConfig): string {
  const headers = config?.headers as Record<string, string> | undefined;
  const authorization = headers?.Authorization ?? headers?.authorization;
  return typeof authorization === 'string' ? authorization : '';
}

function shouldRetry(error: unknown) {
  if (!(error instanceof AxiosError)) return false;
  const status = error.response?.status;
  return status === 429 || status === 503 || status === 502 || status === 504;
}

function computeBackoffMs(attempt: number, opts: Required<Pick<RetryOptions, 'baseDelayMs' | 'maxDelayMs'>>) {
  const exp = opts.baseDelayMs * Math.pow(2, attempt);
  const jitter = Math.floor(Math.random() * 150);
  return Math.min(opts.maxDelayMs, exp + jitter);
}

export async function axiosGetWithRetry<T>(
  url: string,
  config?: AxiosRequestConfig,
  options?: RetryOptions
): Promise<AxiosResponse<T>> {
  const retries = options?.retries ?? 2;
  const baseDelayMs = options?.baseDelayMs ?? 400;
  const maxDelayMs = options?.maxDelayMs ?? 8_000;
  const dedupe = options?.dedupe ?? true;

  const cacheKey = `CACHE:${url}:${getAuthHeaderValue(config)}`;
  if (options?.cache) {
    const cached = responseCache.get(cacheKey);
    const ttl = options.cacheTtlMs ?? DEFAULT_CACHE_TTL_MS;
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data as AxiosResponse<T>;
    }
  }

  const dedupeKey = options?.dedupeKey ?? `GET:${url}:${getAuthHeaderValue(config)}`;

  const run = async () => {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await axios.get<T>(url, config);
      } catch (err) {
        if (attempt >= retries || !shouldRetry(err)) throw err;
        const retryAfterMs = parseRetryAfterMs(
          (err as AxiosError)?.response?.headers?.['retry-after']
        );
        const delayMs = retryAfterMs ?? computeBackoffMs(attempt, { baseDelayMs, maxDelayMs });
        await sleep(delayMs);
      }
    }
    throw new Error('Request failed');
  };

  if (!dedupe) return run();
  const existing = inflightGets.get(dedupeKey) as Promise<AxiosResponse<T>> | undefined;
  if (existing) return existing;

  const promise = run()
    .then((result) => {
      if (options?.cache) {
        responseCache.set(cacheKey, { data: result, timestamp: Date.now() });
      }
      return result;
    })
    .finally(() => {
      inflightGets.delete(dedupeKey);
    });
  inflightGets.set(dedupeKey, promise as unknown as Promise<unknown>);
  return promise;
}

export function invalidateCache(urlPrefix?: string): void {
  if (!urlPrefix) {
    responseCache.clear();
    return;
  }
  for (const key of responseCache.keys()) {
    if (key.includes(urlPrefix)) {
      responseCache.delete(key);
    }
  }
}
