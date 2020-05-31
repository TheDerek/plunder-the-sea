import crypto from "crypto"

class Game {
  constructor(admin) {
    this.id = crypto.randomBytes(3).toString("hex")
    this.admin = admin;
  }
}

const games = {}

function newGame(client, request) {
  const game = new Game(client);
  games[game.id] = game;

  console.log("Created game with id " + game.id);

  return {
    action: "createdNewGame",
    data: {
      id: game.id
    }
  };
}

export const requests = {
  "newGame": newGame
}
