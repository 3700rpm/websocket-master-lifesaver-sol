import { WebSocket } from 'ws';

const testSocket = async () => {
  const testSock = new WebSocket('wss://stream-lb.ape.pro/ws');

  testSock.on('open', () => {
    console.log('Connected to test socket');
    testSock.send(JSON.stringify({"type":"subscribe:charts","assets":["Gyo9MkSvhMKyivtHGeTLVBKMvU9NtKtQkZ1S8qd7pump"]}))
    // testSock.send(JSON.stringify({"type":"subscribe:pool","pools":["879F697iuDJGMevRkRcnW21fcXiAeLJK1ffsw2ATebce"]}));
  });

  testSock.on('message', async (data: any) => {
    console.log('Received message:', data.toString());
    console.log('Received message:', data);

    // if (message.type === 'updates') {
    //   // console.log('Pool updates:', message.data);
    //   const data = message.data[0];
    //   // console.log('Pool update:', message.data[1]);
    //   if (data.type === 'update') {
    //     console.log('Pool update:', data.pool);
    //   }
    // }
  });

  testSock.on('close', () => {
    console.log('Disconnected from test socket');
  });

  testSock.on('error', (error: any) => {
    console.error('Error:', error);
  });

}

testSocket();