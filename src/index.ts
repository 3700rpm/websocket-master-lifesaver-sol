import mongooseConnect from "./database";
import localSocket from "./localSocket";
import { solanaNewPoolStream } from "./solanaNewPoolStream";
import express from "express";
import websocket from "ws";

const start = async () => {
  await mongooseConnect();
  localSocket();
  solanaNewPoolStream();
}

start();