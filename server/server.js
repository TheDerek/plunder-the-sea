import WebSocket from "ws"

import { requests } from "./logic.js"

// Start the server
const PORT = 3030;
const server = new WebSocket.Server({port: PORT}); 
console.log(`Started server on port ${PORT}`);

server.on("connection", (client) => {
  console.log(`Connected!, # clients = ${server.clients.size}`)

  client.on("message", (message) => {
    console.log("request=" + message);

    const request = JSON.parse(message);
    const response = requests[request.name](client, request.data);

    if (response) {
      const stringResponse = JSON.stringify(response);
      console.log("response=" + stringResponse);
      client.send(stringResponse);
    }
  });
});
