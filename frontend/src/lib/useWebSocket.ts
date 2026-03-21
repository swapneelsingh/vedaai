import { useEffect, useRef, useCallback } from 'react';
import { WSMessage } from '../types';

interface UseWebSocketOptions {
  jobId: string | null;
  onMessage: (msg: WSMessage) => void;
  onError?: (err: Event) => void;
}

export function useJobWebSocket({ jobId, onMessage, onError }: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();
  const mountedRef = useRef(true);

  const connect = useCallback(() => {
    if (!jobId || !mountedRef.current) return;

    // const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000'}/ws?jobId=${jobId}`;
    const base = (process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000').replace(/\/$/, '');
    const wsUrl = `${base}/ws?jobId=${jobId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => console.log(`WS connected for job ${jobId}`);

    ws.onmessage = (event) => {
      try {
        const msg: WSMessage = JSON.parse(event.data);
        onMessage(msg);
      } catch (e) {
        console.error('WS parse error:', e);
      }
    };

    ws.onerror = (err) => {
      console.error('WS error:', err);
      onError?.(err);
    };

    ws.onclose = () => {
      if (mountedRef.current) {
        reconnectRef.current = setTimeout(connect, 3000);
      }
    };
  }, [jobId, onMessage, onError]);

  useEffect(() => {
    mountedRef.current = true;
    connect();
    return () => {
      mountedRef.current = false;
      clearTimeout(reconnectRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { disconnect: () => wsRef.current?.close() };
}
