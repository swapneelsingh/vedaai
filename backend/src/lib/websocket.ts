import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { WSMessage } from '../types';

const clients = new Map<string, Set<WebSocket>>();

export function initWebSocket(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    const url = new URL(req.url || '', `http://localhost`);
    const jobId = url.searchParams.get('jobId');

    if (jobId) {
      if (!clients.has(jobId)) clients.set(jobId, new Set());
      clients.get(jobId)!.add(ws);

      ws.on('close', () => {
        clients.get(jobId)?.delete(ws);
        if (clients.get(jobId)?.size === 0) clients.delete(jobId);
      });

      ws.send(JSON.stringify({ type: 'CONNECTED', jobId }));
    } else {
      ws.close(1008, 'Missing jobId');
    }
  });

  return wss;
}

export function notifyClients(jobId: string, message: WSMessage): void {
  const jobClients = clients.get(jobId);
  if (!jobClients) return;

  const payload = JSON.stringify(message);
  jobClients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    }
  });
}
