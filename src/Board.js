import React from 'react';
import './Board.css';
import Square from './Square'

class Board extends React.Component {


    renderSquare(i) {
      return <Square
                isSubsPlaced={ this.props.subsPlaced }
                value={this.props.board[i]} 
                onClick={() => { this.props.onClick(i) }} 
                key={i} 
                boardSize={this.props.boardSize}
                disabled={this.props.disabled}
                isPlayerOneTurn={this.props.isPlayerOneTurn}
             />;
    }
    

    render() {
        //PRINTING THE BOARD TO THE SCREEN

        const printBoard = [...Array(this.props.boardSize).keys()].map(index => {
           return this.renderSquare(index);
        });

        // Showing which subs to place on board
        const subsToPlaceList = this.props.subsConfig && 
                                this.props.status ==='pre-game' && 
                                this.props.subsConfig.map(sub => {
                                if(sub.count !== sub.placed) {
                                    return <li key={sub.name}><span>{sub.count - sub.placed} {sub.name}s  of size {sub.size}</span></li>;
                                }
                                return null;
                            });

      return (
          <React.Fragment>
            { this.props.subsConfig &&
            <div className="subs-to-place">
                <ul>{subsToPlaceList}</ul>
            </div>
            }       
            <div className="board-container">
                {printBoard}
            </div>

          </React.Fragment>
      );
    };
}
export default Board;