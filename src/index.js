import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Chip(props) {
  return <div className="chip">Level: {props.level}</div>;
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
      <div>
        <h2>Add player</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Name:
            <input
              type="text"
              value={this.state.value}
              onChange={this.handleChange}
            />
          </label>
          <input type="submit" value="Submit" />
        </form>
      </div>
    );
  }
}

function Player(props) {
  return <li>{props.name}</li>;
}

function Players(props) {
  let players = props.players;
  let playerItems = players.map((player, index) =>
    React.createElement(Player, { key: index, name: player.name })
  );
  return (
    <div>
      <h2>Players</h2>
      <ol>{playerItems}</ol>
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
        <button onClick={this.props.startGameCallBack}>Start Game</button>
      </div>
    );
  }

  renderPlaying() {
    let player = this.props.currentPlayer;
    return (
      <div>
        <h2>Playing the game!</h2>
        <p>Current turn: {player.displayName}</p>
        <button disabled>Make {player.displayName} turn back after moving</button>
        <br/>
        <button onClick={this.props.rollDiceCallback}>Roll the dice for {player.displayName}</button>
      </div>
    );
  }

  renderRolled() {
    let player = this.props.currentPlayer;
    return (
      <div>
        <h2>Playing the game!</h2>
        <p>{player.displayName} rolled a {this.props.rolled}</p>
      </div>
    );
  }

  render() {
    if (this.props.gameState === "pregame") {
      return this.renderAddPlayers();
    }

    if (this.props.gameState === "playing") {
      return this.renderPlaying();
    }

    if (this.props.gameState == "rolled") {
      return this.renderRolled();
    }
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chips: this.createChips(),
      players: [],
      gameState: "pregame",
      currentPlayerId: null,
      rolled: null
    };
  }

  getCurrentPlayer() {
    console.log(this.state.players[this.state.currentPlayerId]);
    return this.state.players[this.state.currentPlayerId];
  }


  render() {
    let chips = this.state.chips;
    let chipsElements = chips.map((chip, index) =>
      React.createElement(Chip, {
        key: index,
        level: chip.level,
        player: chip.player,
      })
    );

    return (
      <div>
        <div>{chipsElements}</div>
        <hr />
        <GameControl
          gameState={this.state.gameState}
          addPlayerCallBack={this.handleAddPlayer.bind(this)}
          startGameCallBack={this.handleStartGame.bind(this)}
          currentPlayer={this.state.players[this.state.currentPlayerId]}
          rollDiceCallback={this.rollDice.bind(this)}
          rolled={this.state.rolled}
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
          level: l,
          player: null,
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
          displayName: name + " (" + (this.state.players.length + 1) + ")",
          position: null,
          rolled: null
        },
      ]),
    });
  }

  rollDice() {
    const faces = [1, 1, 2, 2, 3, 3]

    let dice1 = faces[Math.floor(Math.random() * faces.length)];
    let dice2 = faces[Math.floor(Math.random() * faces.length)];

    let rolled = dice1 + dice2;

    this.setState({
      gameState: "rolled",
      rolled: rolled
    });
  }

  handleStartGame() {
    this.setState({
      gameState: "playing",
      currentPlayerId: 0
    });
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));
