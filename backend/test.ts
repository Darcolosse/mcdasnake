import WebSocket from 'ws';

const wss = new WebSocket.Server({ port: 8080 });
const clients = new Map();

wss.on('connection', (ws, req) => {
  // Stocke les infos de base
  clients.set(ws, {
    ip: req.socket.remoteAddress,
    userId: null,
    username: null,
    connectedAt: new Date()
  });

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'auth') {
      const client = clients.get(ws);
      client.userId = data.userId;
      client.username = data.username;
      console.log(`Auth: ${client.username} (IP: ${client.ip})`);
    }
  });

  ws.on('close', () => {
    const client = clients.get(ws);
    console.log(`Déconnexion de ${client.username}`);
    clients.delete(ws);
  });
});
