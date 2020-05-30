import WebSocket from "ws"
import crypto from "crypto"

class Game {
  constructor(admin) {
    this.id = crypto.randomBytes(3).toString("hex")
  }
}

// The dictonary of games
const games = {}

// Start the server
const PORT = 3030;
const server = new WebSocket.Server({port: PORT}); 
console.log(`Started server on port ${PORT}`);

server.on("connection", (client) => {
  console.log(`Connected!, # clients = ${server.clients.size}`)

  client.on("message", (message) => {
    //const game = new Game(socketClient);
    console.log("Got this message " + message);

    const data = JSON.parse(message);

    switch(data.action) {
      case "newGame":
        return newGame(client);
        break;
    };
  });
});

function newGame(client) {
  const game = new Game(client);
  games[game.id] = game;

  console.log("Created game with id " + game.id);
  client.send(JSON.stringify({
    action: "createdNewGame",
    data: {
      id: game.id
    }
  }));
}
