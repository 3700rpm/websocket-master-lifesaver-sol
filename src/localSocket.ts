// src/server.ts
import WebSocket, { WebSocketServer } from 'ws';

const port = 8080;
const wss = new WebSocketServer({ port });

// Store clients with their associated tags
const clients: Record<string, WebSocket> = {};

const localSocket = async () => {
  wss.on('connection', (ws: WebSocket) => {
    ws.on('message', (data: any) => {
      const message = JSON.parse(data.toString());
  
      // Check if the message includes a tag and associate the WebSocket with that tag
      if (message.tag) {
        clients[message.tag] = ws;
        console.log(`Client with tag ${message.tag} connected`);
      } else{
        console.log('Received message:', message);
      }
  
      if (message.targetTag && clients[message.targetTag]) {
        // Forward the message to the client with the specified tag
        clients[message.targetTag].send(JSON.stringify({ from: 'server', message: message }));
        console.log(`Forwarded message to ${message.targetTag}: "${message.message}"`);
      }
    });
  
    ws.on('close', () => {
      // Remove any clients that disconnect
      for (const tag in clients) {
        if (clients[tag] === ws) {
          delete clients[tag];
          console.log(`Client with tag ${tag} disconnected`);
        }
      }
    });
  });
  
  console.log(`Local Socket server is running on ws://localhost:${port}`);
}

export default localSocket;

