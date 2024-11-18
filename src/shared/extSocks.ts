import { WebSocket } from "ws";

// Class to manage external socket
class ExtSock {
  // @ts-ignore
  localSocket: WebSocket.Server | null;

  constructor() {
    this.localSocket = null;
  }
  // @ts-ignore
  setSocket(socket: WebSocket.Server) {
    this.localSocket = socket;
  }
  // @ts-ignore
  getSocket(): WebSocket.Server | null {
    return this.localSocket;
  }
}

const extSockInstance = new ExtSock();

export {
  extSockInstance,
}