import WebSocketServiceSts from "./websocket.st";

const wsService = new WebSocketServiceSts("wss://data.solanatracker.io");
 
// 1. Latest Tokens/Pools
wsService.joinRoom("latest");
wsService.on("latest", (data: any) => {
  console.log("Latest token/pool update:", data);
});
 
// // 2. Pool Changes
// wsService.joinRoom(`pool:${poolId}`);
// wsService.on(`pool:${poolId}`, (data) => {
//   console.log(`Pool ${poolId} update:`, data);
// });
 
// // 3. Pair Transactions
// wsService.joinRoom(`transaction:${tokenAddress}:${poolId}`);
// wsService.on(`transaction:${tokenAddress}:${poolId}`, (data) => {
//   console.log(`New transaction for ${tokenAddress} in pool ${poolId}:`, data);
// });
 
// 4. Pair and Wallet Transactions
// wsService.joinRoom(`transaction:${tokenAddress}:${poolId}:${walletAddress}`);
// wsService.on(
//   `transaction:${tokenAddress}:${poolId}:${walletAddress}`,
//   (data) => {
//     console.log(
//       `New transaction for ${tokenAddress} in pool ${poolId} for wallet ${walletAddress}:`,
//       data
//     );
//   }
// );
 
// 5. Price Updates
// wsService.joinRoom(`price:${poolId}`);
// wsService.on(`price:${poolId}`, (data) => {
//   console.log(`Price update for pool ${poolId}:`, data);
// });
 
const tokenId = '8J9VM5GNHKZp4ETSRDru98vwJJkybTktVdJiPEhYRKz6';
wsService.joinRoom(`price-by-token:${tokenId}`); // Make sure to use latest version of websocket service.
wsService.on(`price-by-token:${tokenId}`, (data: any) => {
  console.log(`Price update for token ${tokenId}:`, data);
});
 
// 6. Wallet Transactions
// wsService.joinRoom(`wallet:${walletAddress}`);
// wsService.on(`wallet:${walletAddress}`, (data) => {
//   console.log(`New transaction for wallet ${walletAddress}:`, data);
// });