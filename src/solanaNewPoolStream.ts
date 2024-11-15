import WebSocketService from "./websocket";

const solanaNewPoolStream = async () => {
  new WebSocketService("wss://ny.solana.dex.blxrbdn.com/ws", 'NTRiZmNkZjAtODYxZC00MmYxLWE1OTAtMDU3N2NlMjg1MWE0OjZkN2E2MDliOTkwYjU1Y2IwN2MwMmNkM2Q4NjNiNjU4');
}

export { solanaNewPoolStream };