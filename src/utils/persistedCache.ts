// Cache leve em sessionStorage para sobreviver a reloads dentro da mesma aba/sessão.
// Cada recurso define seu próprio TTL, alinhado ao tempo de cache do Redis no backend
// (ver notas de performance do backend). Isso evita repetir chamadas de API logo após
// um F5 quando os dados ainda estariam "quentes" no servidor.

interface CachedPayload<T> {
  data: T;
  timestamp: number;
}

const PREFIX = 'nl-library-cache:';

export function loadCachedData<T>(key: string, ttlMs: number): T | null {
  try {
    const raw = sessionStorage.getItem(PREFIX + key);
    if (!raw) return null;

    const parsed: CachedPayload<T> = JSON.parse(raw);
    if (Date.now() - parsed.timestamp > ttlMs) {
      sessionStorage.removeItem(PREFIX + key);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

export function saveCachedData<T>(key: string, data: T): void {
  try {
    const payload: CachedPayload<T> = { data, timestamp: Date.now() };
    sessionStorage.setItem(PREFIX + key, JSON.stringify(payload));
  } catch {
    // sessionStorage indisponível (modo privado, cota excedida etc.) — cache é best-effort
  }
}

export function clearCachedData(key: string): void {
  try {
    sessionStorage.removeItem(PREFIX + key);
  } catch {
    // no-op
  }
}

// Remove todas as entradas cuja chave começa com `keyPrefix` — usado por caches
// que têm uma entrada por combinação de parâmetros (ex.: página + filtros) e
// precisam ser invalidados inteiros quando os dados subjacentes mudam.
export function clearCachedDataByPrefix(keyPrefix: string): void {
  try {
    const fullPrefix = PREFIX + keyPrefix;
    const keysToRemove: string[] = [];

    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(fullPrefix)) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    // no-op
  }
}
