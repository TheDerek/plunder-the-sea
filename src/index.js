import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Chip(props) {
    let playerElement = null;
    if (props.player) {
        playerElement = (
            <div className="chip-player">{props.player.displayName}</div>
        )
    } else {
        playerElement = (
            <div className="chip-player"></div>
        )
    }

    let chipStatus = "chip-status ";
    chipStatus += props.plundered ? "chip-status-plundered" : "chip-status-unplundered";
    let plunderStatus = props.plundered ? "Plundered" : "Unplundered";

    let levelText = "";
    for (let i = 0; i < props.level; i++) {
        levelText += "•";
    }

    let levelClass = "chip-level chip-level-" + props.level;

    return (
        <div className="chip">
            <div className={levelClass}>
                {levelText}
            </div>
            {playerElement}
            <div className={chipStatus}>{plunderStatus}</div>
        </div>
    );
}

class AddPlayerForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {value: ""};

        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit(props.callBack).bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(parentCallBack) {
        return (event) => {
            event.preventDefault();
            parentCallBack(this.state.value);

            this.setState({value: ""});
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
                    <input type="submit" value="Submit"/>
                </form>
            </div>
        );
    }
}

function Player(props) {
    let playerClass = "player"
    if (props.player.isCurrentTurn()) {
        playerClass += " player-current"
    }

    return (
        <div className={playerClass}>
            <div className="player-name">{props.player.name}</div>
            <div className="player-items">

            </div>
        </div>
    );
}

function Players(props) {
    let players = props.players;
    let playerItems = players.map((player, index) =>
        React.createElement(Player, {key: index, player: player})
    );
    return (
        <div>
            <h2>Players</h2>
            <div>{playerItems}</div>
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
                <AddPlayerForm callBack={this.props.addPlayerCallBack}/>
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
                <button onClick={this.props.movePlayer}>Move {player.displayName} {this.props.rolled} spaces.</button>
            </div>
        );
    }

    renderMoved() {
        let player = this.props.currentPlayer;
        let plunderChip = null;

        return (
            <div>
                <p>{player.displayName} has moved to chip {player.position + 1} !</p>
                <button
                    disabled={this.props.currentChip.plundered}
                    onClick={this.props.plunder}
                >
                    Plunder current location
                </button>
                <button onClick={this.props.endTurn}>End turn</button>
            </div>
        )
    }

    render() {
        if (this.props.gameState === "pregame") {
            return this.renderAddPlayers();
        }

        if (this.props.gameState === "playing") {
            return this.renderPlaying();
        }

        if (this.props.gameState === "rolled") {
            return this.renderRolled();
        }

        if (this.props.gameState === "moved") {
            return this.renderMoved();
        }

        return (
            <p>State {this.props.gameState} has not been added yet</p>
        );
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
                level: chip.level,
                player: chip.player,
                plundered: chip.plundered
            })
        );

        let currentPlayer = this.getCurrentPlayer();
        let currentChip = this.getCurrentChip();

        return (
            <div>
                <header>
                    <h1>Deep Sea Adventure</h1>
                    <p>Unofficial web implementation by <a href="https://github.com/TheDerek">TheDerek</a></p>
                    <p>Original game by <a href="https://oinkgames.com">Oink Games</a></p>
                    <p>Best played with friends in the same room or via your favourite streaming software</p>
                </header>
                <div className="chips">{chipsElements}</div>
                <hr/>
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
                />
                <Players players={this.state.players}/>
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
                    plundered: false
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
                    position: -1, // On the sub
                    isCurrentTurn: () => this.state.currentPlayerId === this.state.players.length,
                    plunder: {
                        1: 0,
                        2: 0,
                        3: 0,
                        4: 0
                    }
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

    movePlayer() {
        const players = this.state.players.slice();
        const player = players[this.state.currentPlayerId];
        const chips = this.state.chips.slice();
        let spacesLeftToMove = this.state.rolled;

        // Remove the player from the chip they started on
        if (player.position > 0) {
            chips[player.position].player = null;
        }

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

        this.setState({
            gameState: "moved",
            players: players,
            chips: chips
        })
    }

    handleStartGame() {
        this.setState({
            gameState: "playing",
            currentPlayerId: 0
        });
    }

    plunder() {
        let players = this.state.players.slice();
        let chips = this.state.chips.slice();

        let player = players[this.state.currentPlayerId];
        let chip = chips[player.position];

        chip.plundered = true;
        player.plunder[chip.level] += 1;

        this.setState({
            chips: chips,
            players: players
        })
    }

    endTurn() {
        let nextPlayerId = null;
        if (this.state.currentPlayerId >= this.state.players.length -1) {
            nextPlayerId = 0;
        } else {
            nextPlayerId = this.state.currentPlayerId + 1;
        }

        this.setState({
            gameState: "playing",
            currentPlayerId: nextPlayerId
        })
    }
}

ReactDOM.render(<Game/>, document.getElementById("root"));
