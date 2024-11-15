// src/pusher.ts
import WebSocket from 'ws';

const serverUrl = 'ws://localhost:8080';
const tagToMessage = 'A1'; // The tag of the client we want to message
const messageToSend = 'Hello, client DEV!';

const pushToBot = async (tag: string) => {
  const ws = new WebSocket(serverUrl);
  ws.on('open', () => {
    console.log('Connected to WebSocket server');
    // Send a message intended for the client with the specific tag
    ws.send(JSON.stringify({ targetTag: 'A2', tokenAddress: 'AE1TqcSKa4Jp4U4S87cFMmHaCG8tAFUJPsGRCLq27DCS', action: 'ALLOCATE_FOR', riskLevel: 'LOW' }));
    console.log(`Message sent! to ${tagToMessage}: "${messageToSend}"`);
    ws.close();
  });

  ws.on('error', (error: any) => {
    console.error('WebSocket error:', error);
  });
}

pushToBot(tagToMessage);

// const pushToBotAction = async (ws: WebSocket, tokenAddress: string, botTag: string) => {
//   try {
//     ws.send(JSON.stringify({ targetTag: botTag, tokenAddress: tokenAddress, action: 'ALLOCATE_FOR', riskLevel: 'UNKNOWN' }));
//     console.log(`Message sent! to ${tagToMessage}: "${messageToSend}"`);
//   } catch (error) {
//     console.log('Error sending message:', error);
//   }
// }

// export { pushToBotAction };