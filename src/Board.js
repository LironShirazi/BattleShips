import React from 'react';
import './Board.css';
import Square from './Square'

class Board extends React.Component {
    // constructor(props) {
    //     super(props);
    //     this.boardId = hashId();
    //     // this.boardSize = boardSize;
    //     this.subs = [];
    //     this.countClicks = 0;
    //     // this.isSubsPlacedCheck = this.isSubPlacedHandler.bind(this);
    //   }  

    //     this.state = {
    //         board: Array(100).fill(null),
    //         subsConfig : [
    //             { name: 'Submarine', size: 4, count: 1, placed: 0 },
    //             { name: 'Cruiser', size: 3, count: 2, placed: 0 },
    //             { name: 'Destroyer', size: 2, count: 2, placed: 0 }
    //         ],
    //         subsPlaced: false
    //     }
    // }

    // componentDidMount() {
    //     if(this.props.subsConfig) 
    //     this.setState({ subsConfig: this.props.subsConfig })
    // }


    // attack = (coords) => {
    //     this.subs.forEach(sub => {
    //         // Hitted a sub
    //         if (sub.subCoordsArr.includes(coords)) {
    //             // hitted and killed
    //             if(!sub.getHitsLeftToDead) {
    //                 this.subs[sub].isDead = true;
    //             }
    //             //missed the hit
    //         } else {
    //             this.board[coords.x][coords.y] = '*';
    //         }
    //     });
    // }


    renderSquare(i) {
      return <Square
                isSubsPlaced={ this.props.subsPlaced }
                value={this.props.board[i]} 
                onClick={() => { this.props.onClick(i) }} 
                key={i} 
                boardSize={this.props.boardSize}
             />;
    }
    

    render() {
        //PRINTING THE BOARD TO THE SCREEN
        console.log(this.props.board);
        console.log(this.props.subsConfig); 
        console.log(this.props.subs);

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