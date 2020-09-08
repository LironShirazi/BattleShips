import React from 'react';

import './Board.css';
import Square from './Square'
import Sub from './Sub';
import hashId from './hashHelperFunction';

class Board extends React.Component {
    constructor(boardSize = 100) {
        super();
        this.boardId = hashId();
        this.boardSize = boardSize;
        this.subs = new Array(5);
        this.countClicks = 0;
        this.x1 = null;
        this.y1 = null;
        
        this.state = {
            board: Array(100).fill(null),
            subsConfig : [
                { name: 'Submarine', size: 4, count: 1, placed: 0 },
                { name: 'Cruiser', size: 3, count: 2, placed: 0 },
                { name: 'Destroyer', size: 2, count: 2, placed: 0 }
            ]
        }
    }

    // componentDidMount() {
    //     if(this.props.subsConfig) 
    //     this.setState({ subsConfig: this.props.subsConfig })
    // }
    componentWillReceiveProps(nextProps) {
        this.setState({ board: Array(nextProps.boardSize).fill(null)});
    }


    //Sets sub coordinates which recevied by the player
  

    attack = (coords) => {
        this.subs.forEach(sub => {
            // Hitted a sub
            if (sub.subCoordsArr.includes(coords)) {
                // hitted and killed
                if(!sub.getHitsLeftToDead) {
                    this.subs[sub].isDead = true;
                }
                //missed the hit
            } else {
                this.board[coords.x][coords.y] = '*';
            }
        });
    }

    
    twoClicksForPlaceSub(i) {
        if(this.state.board[i] !== null) return;

        this.countClicks ++;
        if(this.countClicks == 1) {
            this.x1 = Math.floor(i/10);
            this.y1 = i%10;

        } else if (this.countClicks == 2) {
            const subsConfigHolder = [...this.state.subsConfig];
            const board = [...this.state.board];
            this.x2 = Math.floor(i/10);
            this.y2 = i%10;

            if(this.x1 === this.x2) {
               if(this.y1 === this.y2) {
                console.log('You can not choose the same square. Try again.');
                } else {
                    //two legal clicks made 
                     const coords = [];
                     subsConfigHolder.some((singleSub, index, theArray) => {
                
                        if (singleSub.placed < singleSub.count) {
                            if ((Math.abs(this.y1 - this.y2) +1) === singleSub.size) {
                                console.log('set the ship!');
                                theArray[index].placed ++;
                                

                                // ship selected from left to right on the same row click
                                let dozens = this.x1 * 10;
                                if(this.y1 < this.y2 ) {
                                    for(let i=this.y1; i<=this.y2;i++) {
                                        let combinedPoint = dozens + i;
                                        board[combinedPoint] = 'X';
                                        console.log(combinedPoint);
                                        coords.push(combinedPoint);
                                    }
                                    this.subs.push(new Sub(singleSub.size, coords));


                                    //ship selected from right to left on the same row
                                } else if (this.y1 > this.y2) {
                                     for(let i=this.y1; i>=this.y2; i--) {
                                         let combinedPoint = dozens + i;
                                         board[combinedPoint] = 'X';
                                         coords.push(combinedPoint);
                                     }
                                     this.subs.push(new Sub(singleSub.size, coords));
                                }
                              this.setState({subsConfig: subsConfigHolder, board:board})
                            } else {
                                this.countClicks = 0;
                                return true; 
                            }
                            // console.log(this.subsConfig);
                        }      
                    });
                }
            } else if (this.y1 === this.y2) {
                const coords = [];
                subsConfigHolder.some((singleSub, index, theArray) => {
                    if(singleSub.placed < singleSub.count) {
                        if (Math.abs(this.x1 - this.x2) +1 === singleSub.size) {
                            console.log('set the ship!');
                            theArray[index].placed ++;

                            let remainder = this.y1;
                            if(this.x1 < this.x2) {
                                for(let i=this.x1; i<=this.x2; i++) {
                                    let combinedPoint = i*10 + remainder;
                                    board[combinedPoint] = 'X';
                                    coords.push(combinedPoint)
                                }
                            this.subs.push(new Sub(singleSub.size, coords));
                            } else {
                                for(let i=this.x1; i>=this.x2; i--) {
                                    let combinedPoint = i*10 + remainder;
                                    board[combinedPoint] = 'X';
                                }
                            }

                            this.setState({
                                subsConfig: subsConfigHolder,
                                board: board
                            });

                        } else {
                            console.log('You have to place the current sub size');
                            this.countClicks = 0;
                            return true;
                        }
                    }      
                });
              }
            this.countClicks = 0;
            }
    }

    // placeShipOnClick(i) {
        // this.countClicks ++;
        // if(this.countClicks == 1) {
        //     this.x1 = i/10;
        //     this.y1 = i%10;
        // } else if (this.countClicks == 2) {
        //     if(!this.singleConfigHolder) {
        //         this.singleConfigHolder = this.props.getConfigSubs.pop();
        //     }
        //     if (this.singleConfigHolder.count) {
        //         if((this.x1 === i/10) && (this.y1 + i%10 === this.singleConfigHolder.size - 1)) {
        //             //set ship between 

        //         } 
        //     }
        //     }
        //     this.countClicks = 0;
        // }
    //     const tempBoard = [...this.state.board];
    //     if(!tempBoard[i]) {
    //         tempBoard[i] = 'X';
    //         this.setState({board:tempBoard});
    //     }
       
    // }

    renderSquare(i) {
        
      return <Square
                value={this.state.board[i]} 
                onClick={()=>{this.twoClicksForPlaceSub(i)}} 
                key={i} 
                boardSize={this.props.boardSize}
             />;
    }
    

    render() {
        //PRINTING THE BOARD TO THE SCREEN
        console.log(this.state.board);
        console.log(this.state.subsConfig); 

        const printSquaresHelper = [...Array(this.props.boardSize).keys()].map(index => {
           return this.renderSquare(index);
        });

        const subsToPlaceList = this.state.subsConfig && 
                                this.props.status ==='pre-game' && 
                                this.state.subsConfig.map(sub => {
                                if(sub.count !== sub.placed)
                                return <li key={sub.name}><span>{sub.count - sub.placed} {sub.name}s  of size {sub.size}</span></li>;
        });

      return (
          <React.Fragment>
            { this.state.subsConfig &&
            <div className="subs-to-place">
                <h5>You have to add:</h5>
                <ul>{subsToPlaceList}</ul>
            </div>
            }       
            <div className="board-container">
                {printSquaresHelper}
            </div>

          </React.Fragment>
      );
    };
}
export default Board;