import hashId from './hashHelperFunction';
import React from 'react';
import Board from './Board';
import Sub from './Sub';
import './index.css';

class Game extends React.Component {
    constructor() {
        super();
        this.boardSize = 100;
        this.countClicks = 0;
        this.gameId = hashId();
        this.isSubsPlacedCheck = this.isSubPlacedHandler.bind(this);
        this.player = this.player.bind(this);
        // this.boards = []
        // this.players = players;
        // this.boardSize = boardSize;
        // this.playerTurn = playerTurn;
        // this.actions = [];
        
        
        
        this.state = {
            players: [
                this.player('Liron', Array(this.boardSize).fill(null)),
                this.player('Shahar', Array(this.boardSize).fill(null))
            ],
            boardSize : 100,
            board: Array(this.boardSize).fill(null),
            subsConfig : [
                { name: 'Submarine', size: 4, count: 1, placed: 0 },
                { name: 'Cruiser', size: 3, count: 2, placed: 0 },
                { name: 'Destroyer', size: 2, count: 2, placed: 0 }
            ],
            subs: [],
            subsPlaced: false,
            enemyBoard: Array(this.boardSize).fill(null),
            status: 'pre-game'
        }
    }
    // componentWillReceiveProps(nextProps) {
    //     this.setState({ board: Array(nextProps.boardSize).fill(null)});
    // }

    // setBoardSize(size) {
    //     this.boardSize = size;
    // }

    // winCheck(currentBoard) {
    //     currentBoard.forEach(ship => {
    //         if(ship.isDead === false);
    //         return false;
    //     });
    //     // need to update player's score
    //     return true;
    // }
    player(name, board = []) {
        return {
            name: name,
            playerId : hashId(),
            board: board,
            score: 0
        }
    }

    boardSizeHandler(size) {
        this.setState({boardSize:size*size});
    }
    
    isSubPlacedHandler () {
        const isPlaced = this.state.subsConfig.every(sub => sub.count === sub.placed);
        if(isPlaced) {
            this.setState({ subsPlaced: isPlaced, status: 'game-started' });
        }
    }

    twoClicksForPlaceSub(i) {
        if(this.state.board[i] !== null) return; // already caught point

        this.countClicks ++;
        if(this.countClicks === 1) {
            this.x1 = Math.floor(i/10);
            this.y1 = i%10;

        } else if (this.countClicks === 2) {
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
                     let createSub;
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
                                    createSub = new Sub(singleSub.size, coords, false);
                                  
                                    //ship selected from right to left on the same row
                                } else if (this.y1 > this.y2) {
                                     for(let i=this.y1; i>=this.y2; i--) {
                                         let combinedPoint = dozens + i;
                                         board[combinedPoint] = 'X';
                                         coords.push(combinedPoint);
                                     }
                                     createSub = new Sub(singleSub.size, coords, false);
                                    }
                              this.setState({
                                  subsConfig: subsConfigHolder, 
                                  board:board,
                                  subs : this.state.subs.concat(createSub)
                                })
                            } else {
                                this.countClicks = 0;
                                return true; 
                            }
                            // console.log(this.subsConfig);
                        } 
                          
                        this.isSubsPlacedCheck();
                        return null;   
                    });
                }
            } else if (this.y1 === this.y2) {
                const coords = [];
                let createSub;
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
                                    coords.push(combinedPoint);
                                }
                                createSub = new Sub(singleSub.size, coords, false);
                            } else {
                                for(let i=this.x1; i>=this.x2; i--) {
                                    let combinedPoint = i*10 + remainder;
                                    board[combinedPoint] = 'X';
                                }
                            }

                            this.setState({
                                subsConfig: subsConfigHolder,
                                board: board,
                                subs: this.state.subs.concat(createSub)
                            });

                        } else {
                            console.log('You have to place the current sub size');
                            this.countClicks = 0;
                            return true;
                        }
                    } 
                    this.isSubsPlacedCheck();
                    return false;      
                });
              }
            this.countClicks = 0;
            }
    }

    render() {
        console.log(this.state.players);

        return (
            <div className="main">
                <div className="button-selectors">
                        <h1>BattleShip</h1>
                        <h4>Please select board size</h4>
                        <button value={10} onClick={(e) => this.boardSizeHandler(e.target.value)}>10X10</button>
                        <button value={14} onClick={(e) => this.boardSizeHandler(e.target.value)}>14X14</button>
                <div>
                   {
                    this.state.status === 'pre-game' ?
                    <p>Please place on the board:</p>  :
                    this.state.status === 'game-started' ? 
                    <p>Player 1 its your turn, choose a spot to attack!</p> : null
                   }
                </div> 
                </div>
                <div className="boards-place">
                    {/*(My Board)Choosing ships board*/}
                    <Board 
                        boardSize={this.state.boardSize} 
                        subsConfig={this.state.subsConfig} 
                        status={this.status} 
                        board={this.state.board}
                        onClick={ (i) => this.twoClicksForPlaceSub(i)}
                        subsPlaced={this.state.isPlaced}
                        subs={this.state.subs}

                    /> 

                    {/*Playing Board(enemy board)*/}        
                    <Board 
                        boardSize={this.state.boardSize} 
                        status={this.state.status}
                        board={this.state.enemyBoard}
                    

                    />   
                    
                </div>
            </div>
        );
    }
}

export default Game;