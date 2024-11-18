import mongooseConnect from "./database";
import { localSocket } from "./localSocket";
import { solanaNewPoolStream } from "./solanaNewPoolStream";
import "dotenv/config";

const start = async () => {
  await mongooseConnect();
  await localSocket();
  console.log('Server Ready')
  solanaNewPoolStream();
}

start();