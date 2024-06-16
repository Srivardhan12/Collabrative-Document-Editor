import express from 'express'
import { WebSocketServer, WebSocket } from 'ws'

const app = express()
const httpServer = app.listen(8080)
const mouseMovementServer = app.listen(8081)

const wss = new WebSocketServer({ server: httpServer });
const wssMouseMoment = new WebSocketServer({ server: mouseMovementServer });

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });
});


wssMouseMoment.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('message', function message(data, isBinary) {
    wss.clients.forEach(function each(client) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });
});
console.log("Listining to port 5173")