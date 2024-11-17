import mongooseConnect from "./database";
import localSocket from "./localSocket";
import { solanaNewPoolStream } from "./solanaNewPoolStream";
import express from "express";

const start = async () => {
  await mongooseConnect();
  localSocket();
  solanaNewPoolStream();
}

const app = express

start();