import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import cors from "cors";
import router from './router';
import { extSockInstance } from './shared/extSocks';

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(
  {
    origin: '*',
  }
));

app.use(router);
const server = http.createServer(app);

const port = 8080;
const wss = new WebSocketServer({ server });
wss.setMaxListeners(1000);

// Store clients with their associated tags
const clients: Record<string, WebSocket> = {};


const localSocket = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      wss.on('connection', (ws: WebSocket) => {
        ws.on('message', async (data: any) => {
          try {
            const message = JSON.parse(data.toString());
            // Check if the message includes a tag and associate the WebSocket with that tag
            if (message.tag) {
              clients[message.tag] = ws;
              console.log(`Client with tag ${message.tag} connected`);
            } else {
              console.log('Received message:', message);
              wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                  client.send(JSON.stringify(message));
                }
              });
            }

            ws.send(JSON.stringify({ from: 'server', message: message }));

            if (message.targetTag && clients[message.targetTag]) {
              // Forward the message to the client with the specified tag
              // clients[message.targetTag].send(
              //   JSON.stringify({ from: 'server', message: message })
              // );

              console.log(
                `Forwarded message to ${message.targetTag}: "${message.message}"`
              );
            }
          } catch (error) {
            console.log('Error parsing message:', error);
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

        ws.on('error', (error) => {
          console.log('Error:', error);
        });
      });

      // Start the HTTP server and WebSocket server
      server.listen(port, () => {
        extSockInstance.setSocket(wss);
        console.log(`Server started on http://localhost:${port}`);
        console.log(`Local Socket server is running on ws://localhost:${port}`);
        resolve(); // Resolve the promise when the server is ready
      });

      server.on('error', (error) => {
        console.log('Server error:', error);
        reject(error); // Reject the promise if an error occurs
      });
    } catch (error) {
      reject(error); // Catch any unexpected errors
    }
  });
};

export { localSocket, clients };


