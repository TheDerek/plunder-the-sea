import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Chip(props) {
    let playerElement = null;
    if (props.player) {
        playerElement = (
            <div className="chip-player">{getName(props.player)}</div>
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
            <div className="add-player-form-container">
                <p>Add player</p>
                <form onSubmit={this.handleSubmit}>
                    <label>Player name</label>
                    <input
                        type="text"
                        required="required"
                        placeholder='Johnathon "JoJo" Joestar'
                        value={this.state.value}
                        onChange={this.handleChange}
                    />
                    <input type="submit" value="Add player to game"/>
                </form>
            </div>
        );
    }
}

function Plunder(props) {
    let plunderText = "";
    for (let i = 0; i < props.level; i++) {
        plunderText += "•";
    }

    let className = "plunder chip-level-" + props.level;

    return (
        <div className={className}>{plunderText}</div>
    )
}

function PlayerPlunder(props) {
    let plunderItems = props.plunder.map((item) => React.createElement(Plunder, {level: item}))

    return (
        <div className="player-items">
            {plunderItems}
        </div>
    );
}

function getName(player) {
    if (player.hasTurnedBack) {
        return "(←) " + player.name;
    } else {
        return player.name + " →";
    }
}

function Player(props) {
    let playerClass = "player"
    if (props.player.isCurrentTurn) {
        playerClass += " player-current"
    }

    let playerName = props.player.name;

    return (
        <div className={playerClass}>
            <div className="player-name">{props.player.name} →</div>
            <PlayerPlunder plunder={props.player.plunder}/>
        </div>
    );
}

function Players(props) {
    let players = props.players;
    let playerItems = players.map((player, index) =>
        React.createElement(Player, {key: index, player: player})
    );
    return (
        <div className="players">
            <div className="players-container">
                <h2 className="players-title">Players</h2>
                <div class="players-boxes">{playerItems}</div>
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
                <AddPlayerForm callBack={this.props.addPlayerCallBack}/>
                <button className="start-game-button" onClick={this.props.startGameCallBack}>Start Game</button>
            </div>
        );
    }

    renderPlaying() {
        let player = this.props.currentPlayer;
        return (
            <div>
                <h2>Playing the game!</h2>
                <p>Current turn: {player.name}</p>
                <button disabled>Make {player.name} turn back after moving</button>
                <br/>
                <button onClick={this.props.rollDiceCallback}>Roll the dice for {player.name}</button>
            </div>
        );
    }

    renderRolled() {
        let player = this.props.currentPlayer;
        return (
            <div>
                <h2>Playing the game!</h2>
                <p>{player.name} rolled a {this.props.rolled}</p>
                <button onClick={this.props.movePlayer}>Move {player.name} {this.props.rolled} spaces.</button>
            </div>
        );
    }

    renderMoved() {
        let player = this.props.currentPlayer;
        let plunderChip = null;

        return (
            <div>
                <p>{getName(player)} has moved to chip {player.position + 1} !</p>
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

        let stats = null;
        if (this.props.gameState !== "pregame") {
            stats = (
                <div className="stats">
                    <div className="stat">
                        <div className="stat-title">Current turn</div>
                        <div className="stat-value">Derek</div>
                    </div>
                    <div className="stat">
                        <div className="stat-title">Remaining air</div>
                        <div className="stat-value">40 / 40</div>
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
                    displayName: name,
                    position: -1, // On the sub
                    isCurrentTurn: false,
                    plunder: [],
                    hasTurnedBack: false
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
        // Randomly choose the first player
        let nextPlayerId = Math.floor(Math.random() * this.state.players.length)

        let players = this.state.players.slice();
        players[nextPlayerId].isCurrentTurn = true;

        this.setState({
            gameState: "playing",
            currentPlayerId: nextPlayerId
        });
    }

    plunder() {
        let players = this.state.players.slice();
        let chips = this.state.chips.slice();

        let player = players[this.state.currentPlayerId];
        let chip = chips[player.position];

        chip.plundered = true;
        player.plunder.push(chip.level);

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

        let players = this.state.players.slice();
        players[this.state.currentPlayerId].isCurrentTurn = false;
        players[nextPlayerId].isCurrentTurn = true;

        this.setState({
            gameState: "playing",
            currentPlayerId: nextPlayerId
        })
    }
}

ReactDOM.render(<Game/>, document.getElementById("root"));
