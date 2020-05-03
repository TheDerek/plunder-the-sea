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
    let name = player.name + "(" + player.index + ")";
    return (
      <div>
        <h2>Playing the game!</h2>
        <p>Current turn: {player.name}</p>
        <button disabled>Make {player.name} turn back after moving</button>
        <br/>
        <button>Roll the dice for {this.props.currentPlayer.name}</button>
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
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      chips: this.createChips(),
      players: [],
      gameState: "pregame",
      currentPlayer: null,
    };
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
          currentPlayer={this.state.currentPlayer}
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

  getCurrentPlayer() {
  }

  handleAddPlayer(name) {
    this.setState({
      players: this.state.players.concat([
        {
          index: this.state.players.length,
          name: name,
          position: null
        },
      ]),
    });
  }

  handleStartGame() {
    this.setState({
      gameState: "playing",
      currentPlayer: this.state.players[0]
    });
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));
