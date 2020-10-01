import React from 'react';
import './Board.css';
import Square from './Square'

class Board extends React.Component {
    renderSquare(i) {
      return <Square
                value={this.props.board[i]} 
                onClick={() => { this.props.onClick(i) }} 
                key={i} 
                boardSize={this.props.boardSize}
                disabled={this.props.disabled}
                isPlayerOneTurn={this.props.isPlayerOneTurn}
                hover={!this.props.disabled}
             />;
    }
    

    render() {
        //PRINTING THE BOARD TO THE SCREEN
        const printBoard = [...Array(this.props.boardSize).keys()].map(index => {
           return this.renderSquare(index);
        });

      return (
          <React.Fragment>
            <div className="board-container">
                {printBoard}
            </div>
          </React.Fragment>
      );
    };
}
export default Board;