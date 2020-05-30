import WebSocket from "ws"

const PORT = 3030;

const server = new WebSocket.Server({port: PORT}); 

console.log(`Started server on port ${PORT}`);

server.on("connection", (socketClient) => {
  console.log(`Connected!, # clients = ${server.clients.size}`)

  server.on("close", (socketClient) => {
    console.log(`Closed!, # clients = ${server.clients.size}`)
  });
});
