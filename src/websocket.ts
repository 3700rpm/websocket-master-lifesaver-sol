import EventEmitter from "eventemitter3";
import WebSocket from "ws";
import { rugCheck, RugCheckMinSummary } from "./rugcheck";
import { BloxRouteNewLiquidityPool } from "./interfaces/bloxRouteNewWebSocket";
import { verifyToken } from "./utils/verifyToken";

const BotsToAllocateSequentially = [
  // "A1",
  // "A2",
  // "A3",
  // "A4",
  "A5",
  // "A6",
];

let currentBotIndex = 0;
let currentBot = BotsToAllocateSequentially[currentBotIndex % BotsToAllocateSequentially.length];

interface MessageData {
  tx?: string;
  token?: string;
}

interface WebSocketMessage {
  type: string;
  room: string;
  data: MessageData;
}

// Define the subscription payload
const subscribePayload = {
  jsonrpc: "2.0",
  id: 1,
  method: "subscribe",
  params: ["GetNewRaydiumPoolsStream", {}]
};

class WebSocketService {
  private wsUrl: string;
  private socket: WebSocket | null;
  private localSocket: WebSocket | null;
  private reconnectAttempts: number;
  private reconnectDelay: number;
  private reconnectDelayMax: number;
  private randomizationFactor: number;
  private emitter: EventEmitter;
  private subscribedRooms: Set<string>;
  private transactions: Set<string>;
  private authHeader: string | undefined;

  constructor(wsUrl: string, authHeaderKey?: string) {
    this.wsUrl = wsUrl;
    this.authHeader = authHeaderKey;
    this.socket = null;
    this.localSocket = null;
    this.reconnectAttempts = 0;
    this.reconnectDelay = 2500;
    this.reconnectDelayMax = 4500;
    this.randomizationFactor = 0.5;
    this.emitter = new EventEmitter();
    this.subscribedRooms = new Set();
    this.transactions = new Set();

    this.connect();

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", this.disconnect.bind(this));
    }
  }

  private async connect() {
    if (this.socket) {
      return;
    }

    try {
      this.socket = new WebSocket(this.wsUrl, {
        headers: {
          Authorization: `${this.authHeader}`,
        }
      });

      this.localSocket = new WebSocket('ws://localhost:8080');


      this.setupSocketListeners(this.socket, "main");
      // this.setupSocketListeners(this.transactionSocket, "transaction");
    } catch (e) {
      console.error("Error connecting to WebSocket:", e);
      this.reconnect();
    }
  }

  private setupSocketListeners(socket: WebSocket, type: string) {
    socket.onopen = () => {
      console.log(`Connected to ${type} WebSocket server`);
      this.reconnectAttempts = 0;
      // this.resubscribeToRooms();
      socket.send(JSON.stringify(subscribePayload));
    };

    const a = 'asd'
    const b = a.match(/asd/)

    socket.onclose = () => {
      console.log(`Disconnected from ${type} WebSocket server`);
      if (type === "main") this.socket = null;
      this.reconnect();
    };

    socket.onmessage = async (event: WebSocket.MessageEvent) => {
      try {
        const eventful = event.data as any;
        const result = JSON.parse(eventful);

        if (result.method === "subscribe") {
          const { slot, pool, timestamp } = result.params.result as BloxRouteNewLiquidityPool;
          console.log('result.params.result', result.params.result);
    
          // Prepare data for console.table
          let tokenAddress = ''
          const tokenIsNative = pool.token1MintAddress === 'So11111111111111111111111111111111111111112' ? true : false;
          
          // console.log('result.params.result', result.params.result);
          tokenAddress = tokenIsNative ? pool.token2MintAddress : pool.token1MintAddress;

          let rugCheckResult: RugCheckMinSummary | undefined;
          try {
            const resultFromRugcheck = await rugCheck(tokenAddress);
            if (!resultFromRugcheck) {
              throw new Error('No rug risk data found');
            }
            rugCheckResult = resultFromRugcheck
          } catch (error) {
            console.log('Unable to fetch rugcheck data:', error);
          }

          if (!rugCheckResult) {
            return;
          }

          const tableData = [{
            Slot: slot,
            TokenSymbol: rugCheckResult.tokenMeta.symbol,
            lpMint: pool.poolAddress,
            TokenAddress: tokenAddress,
            LaunchTime: timestamp,
            isPumpFun: tokenAddress.includes('pump'),
          }];

          console.table(tableData);
          console.log('Date time to timestamp ms', new Date(timestamp).getTime());

          await verifyToken(result.params.result as BloxRouteNewLiquidityPool);

          // this.localSocket?.send(JSON.stringify({ targetTag: 'ext', tokenAddress: tokenAddress, poolAddress: pool.poolAddress }));
        }
        // const message: WebSocketMessage = JSON.parse(event.data);
        // if (message.type === "message") {
        //   if (message.data?.tx && this.transactions.has(message.data.tx)) {
        //     return;
        //   } else if (message.data?.tx) {
        //     this.transactions.add(message.data.tx);
        //   }
        //   if (message.room.includes("price:")) {
        //     this.emitter.emit(`price-by-token:${message.data.token}`, message.data);
        //   }
        //   this.emitter.emit(message.room, message.data);
        // }
      } catch (error) {
        console.error("Error processing message:", error);
      }
    }
  }

  private disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }

    this.subscribedRooms.clear();
    this.transactions.clear();
  }

  private reconnect() {
    console.log("Reconnecting to WebSocket server");
    const delay = Math.min(
      this.reconnectDelay * Math.pow(2, this.reconnectAttempts),
      this.reconnectDelayMax
    );
    const jitter = delay * this.randomizationFactor;
    const reconnectDelay = delay + Math.random() * jitter;

    setTimeout(() => {
      this.reconnectAttempts++;
      this.connect();
    }, reconnectDelay);
  }

  public joinRoom(room: string) {
    this.subscribedRooms.add(room);
    const socket = this.socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "join", room }));
    }
  }

  public leaveRoom(room: string) {
    this.subscribedRooms.delete(room);
    const socket = this.socket;
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "leave", room }));
    }
  }

  public on(room: string, listener: (data: any) => void) {
    this.emitter.on(room, listener);
  }

  public off(room: string, listener: (data: any) => void) {
    this.emitter.off(room, listener);
  }

  public getSocket(): WebSocket | null {
    return this.socket;
  }

  private resubscribeToRooms() {
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN
    ) {
      for (const room of this.subscribedRooms) {
        const socket = this.socket;
        socket.send(JSON.stringify({ type: "join", room }));
      }
    }
  }
}

export default WebSocketService;
