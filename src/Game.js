import hashId from './hashHelperFunction';
import React from 'react';
import Board from './Board';
import './index.css';

class Game extends React.Component {
    constructor(players, playerTurn, actions, boardSize=10) {
        super();
        this.status = 'pre-game';
        this.state = {
            boardSize : 100
        }

        this.gameId = hashId();
        // this.boards = []
        // this.players = players;
        // this.boardSize = boardSize;
        // this.playerTurn = playerTurn;
        // this.actions = [];

        this.gameInit = function(){
            this.boards = new Array(2).fill(new Board(this.boardSize));
            this.actions = [];
        }
    }

    setBoardSize(size) {
        this.boardSize = size;
    }

    winCheck(currentBoard) {
        currentBoard.forEach(ship => {
            if(ship.isDead === false);
            return false;
        });
        // need to update player's score
        return true;
    }

    boardSizeHandler(size) {
        this.setState({boardSize:size*size});
    }

    render() {
        return (
            <div className="main">
                <div className="button-selectors">
                        <h1>BattleShip</h1>
                    {/* <div className="button-selectors"> */}
                        <h4>Please select board size</h4>
                        <button value={10} onClick={(e) => this.boardSizeHandler(e.target.value)}>10X10</button>
                        <button value={14} onClick={(e) => this.boardSizeHandler(e.target.value)}>14X14</button>
                    {/* </div> */}
                </div>
                <div className="boards-place">
                    <Board boardSize={this.state.boardSize} subsConfig={this.subsConfig} status={this.status} /> {/*Choosing ships board*/}
                    <Board boardSize={this.state.boardSize} status={this.status}/>   {/*Playing Board(enemy board)*/}
                </div>
            </div>
        );
    }
}

export default Game;