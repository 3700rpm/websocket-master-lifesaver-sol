import localSocket from "./localSocket";
import { solanaNewPoolStream } from "./solanaNewPoolStream";

const start = async () => {
  localSocket();
  solanaNewPoolStream();
}

start();