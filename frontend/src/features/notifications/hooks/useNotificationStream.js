import { useEffect, useCallback } from 'react';
import { API_URL } from '../../../services/api';

/**
 * Opens GET /api/notifications/stream with Bearer token; parses SSE data frames.
 * Also polls unread count on an interval while the tab is visible.
 */
export function useNotificationStream({
  enabled,
  isMockMode,
  onStreamPayload,
  pollUnreadMs = 8000,
}) {
  const fetchUnreadOnce = useCallback(async () => {
    if (isMockMode) return;
    const token = localStorage.getItem('token');
    if (!token || token === 'dummy-token') return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/unread/count`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (typeof data.count === 'number') {
        onStreamPayload({ unreadCount: data.count });
      }
    } catch {
      /* ignore */
    }
  }, [isMockMode, onStreamPayload]);

  useEffect(() => {
    if (!enabled || isMockMode) return undefined;

    const token = localStorage.getItem('token');
    if (!token || token === 'dummy-token') return undefined;

    let cancelled = false;
    const ac = new AbortController();

    const runStream = async () => {
      try {
        const res = await fetch(`${API_URL}/api/notifications/stream`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });
        if (!res.ok || !res.body) {
          return;
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        while (!cancelled) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let sep;
          while ((sep = buf.indexOf('\n\n')) !== -1) {
            const block = buf.slice(0, sep);
            buf = buf.slice(sep + 2);
            const line = block.split('\n').find((l) => l.startsWith('data:'));
            if (!line) continue;
            const jsonText = line.slice(5).trim();
            if (!jsonText) continue;
            try {
              const msg = JSON.parse(jsonText);
              onStreamPayload(msg);
            } catch {
              /* ignore malformed chunk */
            }
          }
        }
      } catch {
        /* aborted or network */
      }
    };

    runStream();

    const pollRef = setInterval(() => {
      if (!document.hidden) {
        fetchUnreadOnce();
      }
    }, pollUnreadMs);

    const onVis = () => {
      if (!document.hidden) {
        fetchUnreadOnce();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelled = true;
      ac.abort();
      clearInterval(pollRef);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [enabled, isMockMode, onStreamPayload, fetchUnreadOnce, pollUnreadMs]);

  return { fetchUnreadOnce };
}
