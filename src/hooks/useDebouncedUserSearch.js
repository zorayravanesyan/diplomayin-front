import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { searchUsers } from '../services/userService.js';

const DEFAULT_DEBOUNCE_MS = 400;

function normalizeExcludeIds(excludeUserIds, currentUserId) {
  const ids = new Set(
    (excludeUserIds ?? [])
      .map((id) => Number(id))
      .filter((n) => Number.isFinite(n) && n > 0)
  );
  const self = Number(currentUserId);
  if (Number.isFinite(self) && self > 0) {
    ids.add(self);
  }
  return ids;
}

/**
 * Debounced user search — one request per settled query (after debounce).
 */
export function useDebouncedUserSearch({
  enabled = true,
  query = '',
  currentUserId,
  excludeUserIds = [],
  debounceMs = DEFAULT_DEBOUNCE_MS,
  minLength = 1,
}) {
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const excludeKey = useMemo(() => {
    const ids = normalizeExcludeIds(excludeUserIds, currentUserId);
    return [...ids].sort((a, b) => a - b).join(',');
  }, [excludeUserIds, currentUserId]);

  const excludeSet = useMemo(() => {
    const ids = excludeKey ? excludeKey.split(',').map(Number) : [];
    return new Set(ids);
  }, [excludeKey]);

  const requestIdRef = useRef(0);

  useEffect(() => {
    if (!enabled) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    const q = query.trim();
    if (q.length < minLength) {
      setResults([]);
      setSearching(false);
      return undefined;
    }

    let cancelled = false;

    const timer = setTimeout(async () => {
      const reqId = ++requestIdRef.current;
      setSearching(true);

      try {
        const users = await searchUsers(q, { limit: 20 });
        if (cancelled || reqId !== requestIdRef.current) return;

        const filtered = users.filter((u) => !excludeSet.has(Number(u.id)));
        setResults(filtered);
      } catch {
        if (!cancelled && reqId === requestIdRef.current) {
          setResults([]);
        }
      } finally {
        if (!cancelled && reqId === requestIdRef.current) {
          setSearching(false);
        }
      }
    }, debounceMs);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, query, excludeKey, excludeSet, debounceMs, minLength]);

  const clearResults = useCallback(() => {
    requestIdRef.current += 1;
    setResults([]);
    setSearching(false);
  }, []);

  return { results, searching, clearResults };
}
