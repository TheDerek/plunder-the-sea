import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Chip(props) {
  return <div className="chip">Level: {props.level}</div>;
}

class AddPlayerForm extends React.Component {
  constructor(props) {
    super(props)
    this.state = {value: ""};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    alert("Adding new player: " + this.state.value);
    this.setState({value: ""});
    event.preventDefault();
  }

  render() {
    return (
      <div>
        <h2>Add player</h2>
        <form onSubmit={this.handleSubmit}>
          <label>
            Name:
            <input type="text" value={this.state.value} onChange={this.handleChange} />
          </label>
          <input type="submit" value="Submit" />
        </form>
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
    };
  }

  render() {
    let chips = this.state.chips;
    let chipsElement = chips.map((chip, index) =>
      React.createElement(Chip, {
        key: index,
        level: chip.level,
        player: chip.player,
      })
    );

    return (
      <div>
        <div>{chipsElement}</div>
        <AddPlayerForm/>
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
    
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));
