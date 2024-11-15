// src/bot.ts
import WebSocket from 'ws';

const serverUrl = 'ws://localhost:8080';
const ws = new WebSocket(serverUrl);

const wallet = [{
  tag: 'A1'
}, {
  tag: 'A2'
}, {
  tag: 'A3'
}];

const start = async (tag: string) => {
  ws.on('open', () => {
    console.log(`Connected to WebSocket server with tag: ${tag}`);

    // Send the selected tag to the server upon connection
    ws.send(JSON.stringify({ message: 'Hello from bot client!', tag, tokenAddress: 'tokenAddress', action: 'ALLOCATE_FOR' }));
  });

  ws.on('message', (data) => {
    console.log('Received message from server:', data.toString());
  });

  ws.on('close', () => {
    console.log('Disconnected from WebSocket server');
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
};


const engine = async () => {
  try {
    
  } catch (error) {
    
  }
}

// Get the tag argument from the command line
const tag = process.argv[2];
if (wallet.some((item) => item.tag === tag)) {
  start(tag);
} else {
  console.error('Invalid tag. Available tags are:', wallet.map(item => item.tag).join(', '));
}