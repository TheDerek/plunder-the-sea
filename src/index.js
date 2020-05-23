import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import { exampleStates } from "./exampleStates.js";
import { config } from "./config.js";

function Chip(props) {
  let playerElement = null;
  let playerElementLevel =
    "chip-player chip-player-" + (props.plundered ? "1" : props.levels.length);
  if (props.player) {
    playerElement = (
      <div className={playerElementLevel}>{getName(props.player)}</div>
    );
  } else {
    playerElement = <div className={playerElementLevel}></div>;
  }

  let levelText = "";

  if (props.plundered) {
    levelText = "Plundered";
  } else {
    for (let i = 0; i < props.levels[0]; i++) {
      levelText += "•";
    }
  }

  let levelClass =
    "chip-level chip-level-" +
    (props.plundered ? "plundered" : props.levels[0]);

  return (
    <div className="chip">
      <div className={levelClass}>{levelText}</div>
      {playerElement}
    </div>
  );
}

class AddPlayerForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: "" };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit(props.callBack).bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
  }

  handleSubmit(parentCallBack) {
    return (event) => {
      event.preventDefault();
      parentCallBack(this.state.value);

      this.setState({ value: "" });
    };
  }

  render() {
    return (
      <div className="content-box">
        <div className="box-title">Add player</div>
        <form className="box-content" onSubmit={this.handleSubmit}>
          <label>Player name</label>
          <input
            type="text"
            required="required"
            placeholder='Johnathon "JoJo" Joestar'
            value={this.state.value}
            onChange={this.handleChange}
          />
          <input type="submit" value="Add player to game" />
        </form>
      </div>
    );
  }
}

function Plunder(props) {
  let plunderText = "";
  for (let i = 0; i < props.levels[0]; i++) {
    plunderText += "•";
  }

  let className = "plunder chip-level-" + props.levels[0]

  return <div className={className}>{plunderText}</div>;
}

function PlayerPlunder(props) {
  let plunderItems = props.plunder.map((item, index) =>
    React.createElement(Plunder, { key: index, levels: item })
  );

  return <div className="stat-value">{plunderItems}</div>;
}

function getName(player) {
  if (player.hasTurnedBack) {
    return "← " + player.name;
  } else {
    return player.name + " →";
  }
}

function Player(props) {
  let playerClass = "stat";
  if (props.player.isCurrentTurn) {
    playerClass += " stat-highlighted";
  }
  let endClass = "stat-end";
  if (props.player.plunder.length === 0) {
    endClass += " stat-empty";
  }

  return (
    <div className={playerClass}>
      <div className="stat-title">{getName(props.player)}</div>
      <PlayerPlunder plunder={props.player.plunder} />
      <div className={endClass}>£{props.player.money}</div>
    </div>
  );
}

function Players(props) {
  let players = props.players;
  let playerItems = players.map((player, index) =>
    React.createElement(Player, { key: index, player: player })
  );
  return (
    <div className="players">
      <div className="players-container">
        <h2 className="players-title">Players</h2>
        <div className="players-boxes">{playerItems}</div>
      </div>
    </div>
  );
}

class GameControl extends React.Component {
  constructor(props) {
    super(props);
  }

  renderAddPlayers() {
    return (
      <div>
        <AddPlayerForm callBack={this.props.addPlayerCallBack} />
        <button
          className="start-game-button"
          onClick={this.props.startGameCallBack}
        >
          Start Game
        </button>
      </div>
    );
  }

  renderPlaying() {
    let player = this.props.currentPlayer;
    let cannotTurnBack =
      player.position < 0 || player.hasTurnedBack || player.willTurnBack;
    let airText = null;
    let lastRoundText = null;

    if (player.plunder.length > 0) {
      let numPlunder = player.plunder.length;
      let items = numPlunder > 1 ? "items" : "item";
      airText = (
        <p>
          Reduced air by {numPlunder} because {getName(player)} holds{" "}
          {numPlunder} {items} of plunder
        </p>
      );
    } else {
      airText = (
        <p>
          {`Not reducing air because ${getName(player)} holds no rune chips`}
        </p>
      );
    }

    if (this.props.air.current <= 0) {
      lastRoundText = (
        <p>
          The submarine has run out of air for the divers! This will be the{" "}
          <b>last turn of the round</b>. Hopefully {player.name} manages to make
          it back to the submarine!
        </p>
      );
    }

    return (
      <div className="content-box">
        <div className="box-title">🎲 Roll the dice</div>
        <div className="box-content">
          {airText}
          {lastRoundText}
          <button disabled={cannotTurnBack} onClick={this.props.turnBackPlayer}>
            Make {player.name} turn back after moving
          </button>
          <button onClick={this.props.rollDiceCallback}>
            Roll the dice for {player.name}
          </button>
        </div>
      </div>
    );
  }

  getRolledText(rolled, player) {
    if (rolled.reducedBy == 0) {
      return (
        <p>
          {player.name} rolled a <b>{rolled.actual}</b>.
        </p>
      );
    }

    let plunderCount = player.plunder.length;
    let items = plunderCount > 1 ? `${plunderCount} items` : "1 item";

    if (rolled.actual == 0) {
      return (
        <p>
          {player.name} rolled a {rolled.total}. However by being exceptionally
          greedy and holding {items} of plunder they cannot move an inch,
          resulting in them being <b>completely stuck for this turn</b>.
        </p>
      );
    }

    if (rolled.reducedBy > 0) {
      let spaces = rolled.actual > 1 ? "spaces" : "space";
      return (
        <p>
          {player.name} rolled a {rolled.total}. However they are currently
          holding {items} of plunder, meaning they can only move{" "}
          <em>
            <small>
              ({rolled.total}-{rolled.reducedBy}=)
            </small>
          </em>
          <b>{rolled.actual}</b> {spaces}.
        </p>
      );
    }
  }

  renderRolled() {
    let player = this.props.currentPlayer;

    return (
      <div className="content-box">
        <div className="box-title">🏊 Move the diver</div>
        <div className="box-content">
          {this.getRolledText(this.props.rolled, player)}
          <button onClick={this.props.movePlayer}>
            Move {player.name} {this.props.rolled.actual} spaces.
          </button>
        </div>
      </div>
    );
  }

  renderRoundOver() {
    let results = this.props.players.map((player, index) => {
      if (player.drownedLastRound) {
        return (
          <li key={index}>
            <p>
              <b>{player.name}</b> failed to make it back to the submarine
              before the air ran out. Any plunder they were holding sank to the
              bottom of the ocean as they made a frenzied dash to the submarine
              before they drowned.
            </p>
            <p>
              Because of this their gains for the expedition remain{" "}
              <b>£{player.money}</b>.
            </p>
          </li>
        );
      }

      if (player.spentPlunder.length === 0) {
        return (
          <li key={index}>
            <p>
              <b>{player.name}</b> made it back to the submarine safe and sound.
              However they forgot to plunder any treasure along the way, making
              their expedition kind of pointless.
            </p>
            <p>
              Because of this their gains for the expedition remain <b>£0</b>.
            </p>
          </li>
        );
      }

      let plunderItems = player.spentPlunder.map((plunder) => {
        return (
          <li key={index}>
            A level {plunder.level} treasure worth £{plunder.value}
          </li>
        );
      });

      return (
        <li key={index}>
          <p>
            <b>{player.name}</b> successfully made it back to the submarine
            before the air ran out and with plunder to boot! They managed to
            gather:
          </p>
          <ul>{plunderItems}</ul>
          Bringing their total gains for the expedition up to{" "}
          <b>£{player.money}</b>.
        </li>
      );
    });

    return (
      <div className="content-box">
        <div className="box-title">
          Results for round {this.props.round.current - 1}/
          {this.props.round.max}
        </div>
        <div className="box-content">
          <ul>{results}</ul>
          <button onClick={this.props.startGameCallBack}>Next round</button>
        </div>
      </div>
    );
  }

  renderMoved() {
    let player = this.props.currentPlayer;
    let canPlunder =
      !this.props.currentChip.plundered && !player.performedTurnAction;
    let canDrop =
      this.props.currentChip.plundered &&
      player.plunder.length > 0 &&
      !player.performedTurnAction;

    if (player.finished) {
      return (
        <div className="content-box">
          <div className="box-title">Made it back safe and sound</div>
          <div className="box-content">
            <p>
              Congratulations {getName(player)} made it back to the submarine
            </p>
            <button onClick={this.props.endTurn}>End turn</button>
          </div>
        </div>
      );
    }

    return (
      <div className="content-box">
        <div className="box-title">💰 Commence plundering</div>
        <div className="box-content">
          <p>
            {getName(player)} has moved to chip {player.position + 1} !
          </p>
          <button disabled={!canPlunder} onClick={this.props.plunder}>
            Plunder current location
          </button>
          <button disabled={!canDrop} onClick={this.props.dropPlunder}>
            Drop plunder
          </button>
          <button onClick={this.props.endTurn}>End turn</button>
        </div>
      </div>
    );
  }

  render() {
    let stateRender = <p>Error: State not specified</p>;

    if (this.props.gameState === "pregame") {
      stateRender = this.renderAddPlayers();
    }

    if (this.props.gameState === "playing") {
      stateRender = this.renderPlaying();
    }

    if (this.props.gameState === "rolled") {
      stateRender = this.renderRolled();
    }

    if (this.props.gameState === "moved") {
      stateRender = this.renderMoved();
    }

    if (this.props.gameState === "roundOver") {
      stateRender = this.renderRoundOver();
    }

    let stats = null;
    if (
      this.props.gameState !== "pregame" &&
      this.props.gameState !== "roundOver"
    ) {
      stats = (
        <div className="stats">
          <div className="stat">
            <div className="stat-title">Round</div>
            <div className="stat-value">
              {this.props.round.current} / {this.props.round.max}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Current turn</div>
            <div className="stat-value">
              {getName(this.props.currentPlayer)}
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Remaining air</div>
            <div className="stat-value">
              {this.props.air.current} / {this.props.air.max}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="game-control">
        <h2>Game Control</h2>
        {stats}
        {stateRender}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);

    let oldState = localStorage.getItem("gameState");

    if (config.loadPreviousState && oldState) {
      this.state = JSON.parse(oldState);
    } else if (config.exampleState) {
      this.state = exampleStates[config.exampleState];
    } else {
      this.state = {
        chips: this.createChips(),
        players: [],
        gameState: "pregame",
        currentPlayerId: null,
        rolled: null,
        air: { current: 25, max: 25 },
        round: { current: 1, max: 3 },
        availablePlunder: this.generateAvailablePlunder(),
      };
    }
  }

  setState(newState, callback = () => {}) {
    super.setState(newState, () => {
      callback();

      let stringState = JSON.stringify(this.state);
      localStorage.setItem("gameState", stringState);
      console.log(
        "Saved " +
          Buffer.byteLength(stringState) +
          " bytes of memory to local storage"
      );
    });
  }

  generateAvailablePlunder() {
    let amountPerValue = 2;
    let levels = {
      1: { min: 0, max: 3 },
      2: { min: 4, max: 7 },
      3: { min: 8, max: 11 },
      4: { min: 12, max: 15 },
    };

    let plunder = {};
    for (const level in levels) {
      plunder[level] = [];
      for (let x = levels[level].min; x <= levels[level].max; x++) {
        for (let i = 0; i < amountPerValue; i++) {
          plunder[level].push(x);
        }
      }
    }

    return plunder;
  }

  getCurrentPlayer() {
    return this.state.players[this.state.currentPlayerId];
  }

  getCurrentChip() {
    let currentPlayer = this.getCurrentPlayer();
    let currentChip = null;
    if (currentPlayer && currentPlayer.position >= 0) {
      currentChip = this.state.chips[currentPlayer.position];
    }

    return currentChip;
  }

  render() {
    let chips = this.state.chips;
    let chipsElements = chips.map((chip, index) =>
      React.createElement(Chip, {
        key: index,
        position: index + 1,
        levels: chip.levels,
        player: chip.player,
        plundered: chip.plundered,
      })
    );

    let currentPlayer = this.getCurrentPlayer();
    let currentChip = this.getCurrentChip();

    return (
      <div>
        <header>
          <h1>Deep Sea Adventure</h1>
          <p>
            Unofficial web implementation by{" "}
            <a href="https://github.com/TheDerek">TheDerek</a>
          </p>
          <p>
            Original game by <a href="https://oinkgames.com">Oink Games</a>
          </p>
          <p>
            Best played with friends in the same room or via your favourite
            streaming software
          </p>
        </header>
        <div className="chips">{chipsElements}</div>
        <GameControl
          gameState={this.state.gameState}
          addPlayerCallBack={this.handleAddPlayer.bind(this)}
          startGameCallBack={this.handleStartGame.bind(this)}
          currentPlayer={currentPlayer}
          currentChip={currentChip}
          rollDiceCallback={this.rollDice.bind(this)}
          rolled={this.state.rolled}
          movePlayer={this.movePlayer.bind(this)}
          plunder={this.plunder.bind(this)}
          endTurn={this.endTurn.bind(this)}
          turnBackPlayer={this.turnBackPlayer.bind(this)}
          round={this.state.round}
          air={this.state.air}
          players={this.state.players}
          dropPlunder={this.dropPlunder.bind(this)}
        />
        <Players players={this.state.players} />
      </div>
    );
  }

  createChips() {
    let chips = [];
    let levels = [1, 2, 3, 4];

    for (let l of levels) {
      for (var i = 0; i < 8; i++) {
        chips.push({
          levels: [l],
          player: null,
          plundered: false,
        });
      }
    }

    return chips;
  }

  handleAddPlayer(name) {
    this.setState({
      players: this.state.players.concat([
        {
          index: this.state.players.length,
          name: name,
          position: -1, // On the sub
          isCurrentTurn: false,
          plunder: [],
          // willTurnBack will always be true if hasTurnedBack is true
          willTurnBack: false,
          hasTurnedBack: false,
          finished: false,
          money: 0,
          drownedLastRound: false,
          performedTurnAction: false,
        },
      ]),
    });
  }

  rollDice() {
    const faces = [1, 1, 2, 2, 3, 3];

    let dice1 = faces[Math.floor(Math.random() * faces.length)];
    let dice2 = faces[Math.floor(Math.random() * faces.length)];

    let total = dice1 + dice2;
    let reducedBy = this.getCurrentPlayer().plunder.length;
    let actual = total - reducedBy;

    if (actual < 0) {
      actual = 0;
    }

    this.setState({
      gameState: "rolled",
      rolled: {
        total: total,
        reducedBy: reducedBy,
        actual: actual,
      },
    });
  }

  movePlayer() {
    const players = this.state.players.slice();
    const player = players[this.state.currentPlayerId];
    const chips = this.state.chips.slice();
    let spacesLeftToMove = this.state.rolled.actual;
    let movingBack = player.hasTurnedBack;

    if (spacesLeftToMove !== 0) {
      // Remove the player from the chip they started on
      if (player.position >= 0) {
        chips[player.position].player = null;
      }

      if (player.hasTurnedBack) {
        this.movePlayerBackwards(player, chips, spacesLeftToMove);
      } else {
        this.movePlayerForwards(player, chips, spacesLeftToMove);
      }
    }

    this.setState({
      gameState: "moved",
      players: players,
      chips: chips,
    });
  }

  movePlayerForwards(player, chips, spacesLeftToMove) {
    for (let i = player.position + 1; i < chips.length; i++) {
      let chip = chips[i];

      // Skip this chip if someone is on it
      if (chip.player) {
        continue;
      }

      spacesLeftToMove -= 1;

      if (spacesLeftToMove === 0) {
        player.position = i;
        chip.player = player;
        break;
      }
    }
  }

  movePlayerBackwards(player, chips, spacesLeftToMove) {
    for (let i = player.position - 1; ; i--) {
      let chip = chips[i];

      // Player has successfully made it back to the submarine
      if (i < 0) {
        player.finished = true;
        break;
      }

      // Skip this chip if someone is on it
      if (chip.player) {
        continue;
      }

      spacesLeftToMove -= 1;

      if (spacesLeftToMove === 0) {
        player.position = i;
        chip.player = player;

        break;
      }
    }
  }

  dropPlunder() {
    let players = this.state.players.slice();
    let player = players[this.state.currentPlayerId];
    let chips = this.state.chips.slice();
    let chip = chips[player.position];

    player.performedTurnAction = true;
    chip.level = player.plunder.splice(0, 1);
    chip.plundered = false;

    this.setState({
      players: players,
      chips: chips,
    });
  }

  handleStartGame() {
    // Randomly choose the first player
    let nextPlayerId = Math.floor(Math.random() * this.state.players.length);

    let players = this.state.players.slice();
    players.forEach((player) => (player.drownedLastRound = false));
    players[nextPlayerId].isCurrentTurn = true;

    this.setState({
      gameState: "playing",
      currentPlayerId: nextPlayerId,
      players: players,
    });
  }

  plunder() {
    let players = this.state.players.slice();
    let chips = this.state.chips.slice();

    let player = players[this.state.currentPlayerId];
    let chip = chips[player.position];

    chip.plundered = true;
    player.plunder.push(chip.levels);
    player.performedTurnAction = true;

    this.setState({
      chips: chips,
      players: players,
    });
  }

  endTurn() {
    let players = this.state.players.slice();
    let allFinished = players.every((player) => player.finished);

    // End the round if we have run out of air
    if (this.state.air.current <= 0) {
      return this.endRound();
    }

    // End the round if all players make it back to the submarine
    if (allFinished) {
      return this.endRound();
    }

    let currentPlayer = players[this.state.currentPlayerId];
    currentPlayer.isCurrentTurn = false;
    currentPlayer.performedTurnAction = false;
    if (currentPlayer.willTurnBack) {
      currentPlayer.hasTurnedBack = true;
    }

    let nextPlayerId = this.state.currentPlayerId;
    let nextPlayer = null;
    do {
      nextPlayerId = this.getNextPlayerId(nextPlayerId);
      nextPlayer = players[nextPlayerId];
    } while (nextPlayer.finished);

    nextPlayer.isCurrentTurn = true;

    // Reduce air for the next player's plunder#
    let air = {
      max: this.state.air.max,
      current: this.state.air.current - nextPlayer.plunder.length,
    };

    this.setState({
      gameState: "playing",
      currentPlayerId: nextPlayerId,
      air: air,
    });
  }

  endRound() {
    let players = this.state.players.slice();
    let availablePlunder = Object.assign({}, this.state.availablePlunder);

    // Reset players and add money
    for (let player of players) {
      
      // Give the player money if they managed to finish
      if (player.finished) {
        // Turn plunder into money
        player.spentPlunder = player.plunder.map((plunder) => {
          // plunder is either 1, 2 or 3

          // Get a random item of plunder corresponding to the level
          // of plunder the player is holding
          let plunderForLevel = availablePlunder[plunder];

          // Remove the plunder from the global store and add it to the
          // players wealth
          let value = plunderForLevel.splice(
            Math.floor(Math.random() * plunderForLevel.length),
            1
          )[0];

          player.money += value;

          return {
            level: plunder,
            value: value,
          };
        });
      } else {
        // Drown the player if they didn't make it back to the submarine
        player.drownedLastRound = true;
      }

      // Reset players
      player.plunder = [];
      player.position = -1;
      player.hasTurnedBack = false;
      player.willTurnBack = false;
      player.finished = false;

      console.log("Players new money is " + player.money);
    }

    // Remove plundered rune chips
    let chips = this.state.chips.slice();
    for (let i = chips.length - 1; i >= 0; i--) {
      let chip = chips[i];
      chip.player = null;
      if (chip.plundered) {
        chips.splice(i, 1);
      }
    }

    // Reset the air
    let air = {
      max: this.state.air.max,
      current: this.state.air.max,
    };

    // Increase the round
    let round = {
      current: this.state.round.current + 1,
      max: this.state.round.max,
    };

    this.setState({
      gameState: "roundOver",
      air: air,
      players: players,
      round: round,
      chips: chips,
      availablePlunder: availablePlunder,
    });
  }

  getNextPlayerId(currentPlayerId) {
    if (currentPlayerId >= this.state.players.length - 1) {
      return 0;
    }

    return currentPlayerId + 1;
  }

  turnBackPlayer() {
    let players = this.state.players.slice();
    let currentPlayer = players[this.state.currentPlayerId];

    currentPlayer.willTurnBack = true;

    this.setState({
      players: players,
    });
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));
