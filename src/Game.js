import React from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';

import enemyData from './util/enemyMock';
import hashId from './util/hashHelperFunction';
import Board from './Board';
import Sub from './Sub';
import './index.css';
import StatusLog from './components/StatusLog/StatusLog';
import SubsToPlaceList from './components/SubsToPlaceList';
import HistoryList from './components/HistoryList';



class Game extends React.Component {
    constructor() {
        super();
        this.boardSize = 100;
        this.countClicks = 0;
        this.gameId = hashId();
        this.isSubsPlacedCheck = this.isSubPlacedHandler.bind(this);
        this.player = this.player.bind(this);
        

        // this.actions = [];        
        
        this.state = {
            enemyData: enemyData, 
            players: [
                        this.player('Liron', Array(this.boardSize).fill(null)),
                        this.player('Shahar', Array(this.boardSize).fill(null))
                    ],

            boardSize : 100,
            // board: Array(this.boardSize).fill(null),
            subsConfig : [
                { name: 'Sub', size: 4, count: 1, placed: 0 },
                { name: 'Cruiser', size: 3, count: 2, placed: 0 },
                { name: 'Destroyer', size: 2, count: 2, placed: 0 }
            ],
            subs: [],
            subsPlaced: false,
            status: 'pre-game',
            isPlayerOneTurn : true,
            winner: '',
            stepNumber: 0

        }
    }


    componentDidUpdate(prevProps, prevState) {
        console.log('[componentDidUpdate]: isPlayerOneTurn: ' + this.state.isPlayerOneTurn);
        
        if(this.state.isPlayerOneTurn !== prevState.isPlayerOneTurn) {
            console.log('first if - turn changed');
            if(!this.state.isPlayerOneTurn) {
                console.log('seccond if(player 2 turn)');
                setTimeout( () => this.receiveAttack(), 500);  
                // this.receiveAttack();
                console.log('after update state');  
            }
        }
    }
    // componentWillReceiveProps(nextProps) {
    //     this.setState({ board: Array(nextProps.boardSize).fill(null)});
    // }

    // setBoardSize(size) {
    //     this.boardSize = size;
    // }

    // Receiving Subs array, returns true if player win the enemy
    player(name, board) {
        return {
            name: name,
            playerId : hashId(),
            board: board,
            score: 0,
            subs: [],
            history: [
                {
                    board: Array(this.boardSize).fill(null)
                }
            ]
        }
    }

    jumpTo(step) {
        this.setState({
          stepNumber: step,
          isPlayerOneTurn: step % 2 === 0
        });
      }

    winCheck(subs) {
       return subs.every(sub => {
            if(sub.isDead) return true;
            return false;
        });
    }
    
    receiveAttack() {
        const i = Math.floor(Math.random() * 100);
        const playerData = {
            ...this.state.enemyData, 
            board:[...this.state.players[0].board], 
            subs: [...this.state.players[0].subs] 
        }
            // hit an empty square
            if(playerData.board[i] === null) {
                playerData.board[i] = 'O';
                
            } else if (playerData.board[i] === 'X') { // ship is hitted
                playerData.subs.forEach(sub => { 
                    if(sub.subCoordsArr.includes(i)) { // find the sub (and check if hitted alive ship) 
                        sub.numHits ++;
                       if (sub.getHitsLeftToDead() > 0) { // hitted ship, but not killed yet.
                          playerData.board[i] = '#';
                       } else {  // hitted and killed the ship
                            sub.isDead = true;
                            sub.subCoordsArr.forEach(coord => playerData.board[coord] = '*')
                        }
                    }
                });
            }
            const players = [...this.state.players];
            if(this.winCheck(playerData.subs)) {
                players[1].score++; 
                console.log('player won!');
                this.setState({ winner : playerData.name, status:'player-won' })
            }
            players[0].board = playerData.board;
            this.setState(prevState => {
                return {
                    players: players,
                    isPlayerOneTurn: !prevState.isPlayerOneTurn
                }
            });
    }
        
    boardSizeHandler(size) {
        this.setState({boardSize:size*size});
        this.boardSize = size*size;
    }
    
    isSubPlacedHandler () {
        const isPlaced = this.state.subsConfig.every(sub => sub.count === sub.placed);
        if(isPlaced) {
            this.setState({ 
                subsPlaced: isPlaced,
                status: 'game-started'
            });
        }
    }

    PlayingTurnHandler(i) {
        console.log('[PlayingTurnHandler]: isPlayerOneTurn: ' + this.state.isPlayerOneTurn);
        if(this.state.isPlayerOneTurn) {
        const history = this.state.players[0].history.slice(0,this.state.stepNumber + 1);
        const current = history[history.length -1];
        const board = [...current.board];

        if(board[i] !== null || this.state.status ==='player-won') return; // already clicked square or game eneded.
        const enemyData = {
            ...this.state.enemyData, 
            board:[...this.state.enemyData.board], 
            subs: [...this.state.enemyData.subs] // clone enemy data
        };  
        
        if(enemyData.board[i] === null) {
            board[i] = 'O';
            enemyData.board[i] = 'O';
            
        } else if (enemyData.board[i] === 'X') { // ship is hitted
            enemyData.subs.forEach(sub => { 
                if(sub.subCoordsArr.includes(i)) { // find the sub (and check if hitted alive ship) 
                    sub.numHits ++;
                   if (sub.getHitsLeftToDead() > 0) { // hitted ship, but not killed yet.
                      board[i] = '#';
                      enemyData.board[i] = '#';
                   } else {  // hitted and killed the ship
                        sub.isDead = true;
                        sub.subCoordsArr.forEach(coord => board[coord] = '*')
                         // for view purpose -  if sub is killed show last hit as *  
                    }
           }
        });
    }
        const players = [...this.state.players];
        //need to implement game init for new game if player won the game.
            if(this.winCheck(enemyData.subs)) {
                players[0].score ++; 
                console.log('Player 1 won!')
                this.setState({ winner: players[0].name, status: 'player-won'})
            }
            
            players[0].history = history.concat([{
                board:board
            }])
            players[1].board = board;
            players[1].sub = enemyData.subs; 
            this.setState( prevState => {
                return {
                    players : players,
                    enemyData: enemyData,
                    isPlayerOneTurn: !prevState.isPlayerOneTurn,
                    stepNumber: players[0].history.length - 1,

                }
            });
      }
    }

    placeSubsHandler(i) {
        const boardSizeSqrt = Math.sqrt(this.state.boardSize);
        if(this.state.players[0].board[i] !== null) return; // already caught point

        this.countClicks ++;
        if(this.countClicks === 1) {
            this.x1 = Math.floor(i/boardSizeSqrt);
            this.y1 = i%boardSizeSqrt;

        } else if (this.countClicks === 2) {
            const subsConfigHolder = [...this.state.subsConfig];
            const board = [...this.state.players[0].board];
            this.x2 = Math.floor(i/boardSizeSqrt);
            this.y2 = i%boardSizeSqrt;

            if(this.x1 === this.x2) {
               if(this.y1 === this.y2) {
                   this.countClicks = 0; 
                   console.log('You can not choose the same square. Try again.');
                   return;
                } else {
                    //two legal clicks made 
                     let coords = [];
                     let createSub;
                     subsConfigHolder.some((singleSub, index, theArray) => {
                        if (singleSub.placed < singleSub.count) {
                            if ((Math.abs(this.y1 - this.y2) +1) === singleSub.size) {
                                console.log('set the ship!');
                                theArray[index].placed ++;
                                
                                // ship selected from left to right on the same row click
                                let dozens = this.x1 * boardSizeSqrt;
                                if(this.y1 < this.y2 ) {
                                    for(let i=this.y1; i<=this.y2;i++) {
                                        let combinedPoint = dozens + i;
                                        board[combinedPoint] = 'X';
                                        console.log(combinedPoint);
                                        coords = coords.concat(combinedPoint);
                                    }
                                    createSub = new Sub(singleSub.size, coords);
                                  
                                    //ship selected from right to left on the same row
                                } else if (this.y1 > this.y2) {
                                     for(let i=this.y1; i>=this.y2; i--) {
                                         let combinedPoint = dozens + i;
                                         board[combinedPoint] = 'X';
                                         coords = coords.concat(combinedPoint);
                                     }
                                     createSub = new Sub(singleSub.size, coords);
                                    }

                                this.setState({
                                    subsConfig: subsConfigHolder,
                                    players: this.state.players.map(player => {
                                       if(player.name === 'Liron') {
                                           return { 
                                               ...player, 
                                               board:board,
                                               subs: this.state.players[0].subs.concat(createSub)
                                            }
                                       } else return player;
                                   }),
                                });

                            } else {
                                this.countClicks = 0;
                                return true; 
                            }
                        } 
                          
                        this.isSubsPlacedCheck();
                        return null;   
                    });
                }
            } else if (this.y1 === this.y2) {
                let coords = [];
                let createSub;
                subsConfigHolder.some((singleSub, index, theArray) => {
                    if(singleSub.placed < singleSub.count) {
                        if (Math.abs(this.x1 - this.x2) +1 === singleSub.size) {
                            console.log('set the ship!');
                            theArray[index].placed ++;

                            let remainder = this.y1;
                            if(this.x1 < this.x2) {
                                for(let i=this.x1; i<=this.x2; i++) {
                                    let combinedPoint = i*boardSizeSqrt + remainder;
                                    board[combinedPoint] = 'X';
                                    coords = coords.concat(combinedPoint);
                                }
                                createSub = new Sub(singleSub.size, coords);
                            } else {
                                for(let i=this.x1; i>=this.x2; i--) {
                                    let combinedPoint = i*boardSizeSqrt + remainder;
                                    board[combinedPoint] = 'X';
                                    coords = coords.concat(combinedPoint);
                                }
                                createSub = new Sub(singleSub.size, coords);
                            }
                            
                            this.setState({
                                subsConfig: subsConfigHolder,
                                players: this.state.players.map(player => {
                                   if(player.name === 'Liron') {
                                       return { 
                                           ...player,
                                            board:board,
                                            subs: this.state.players[0].subs.concat(createSub)

                                        }
                                   } else return player;
                               }),
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
        console.log('status : '+ this.state.status)
        console.log(this.state.players[0].board);
        console.log(this.state.players[1].board);
        console.log('isPlayerOneTurn : ' + this.state.isPlayerOneTurn);
        console.log(this.state.enemyData);
        console.log('stepNumber '+ this.state.stepNumber)

        const history = this.state.players[0].history;
        const current = history[this.state.stepNumber];
        

        return (
            <div className="main">
                <div className="main-header">
                        <h1>BattleShip</h1>
                        <h4>Please select board size</h4>
                        <div className="button-selectors">
                            <ButtonGroup variant="contained" color="primary" aria-label="contained primary button group">
                                <Button value={10} onClick={(e) => this.boardSizeHandler(e.currentTarget.value)}>10X10</Button>
                                <Button value={14} onClick={(e) => this.boardSizeHandler(e.currentTarget.value)}>14X14</Button>
                            </ButtonGroup>
                            {/* <button value={10} onClick={(e) => this.boardSizeHandler(e.target.value)}>10X10</button>
                            <button value={14} onClick={(e) => this.boardSizeHandler(e.target.value)}>14X14</button> */}
                        </div>
                <div>
                    <StatusLog 
                        status={this.state.status}
                        isPlayerOneTurn={this.state.isPlayerOneTurn}
                        playerOneName={this.state.players[0].name} 
                        playerTwoName={this.state.players[1].name} 
                        winner={this.state.winner}
                    />
                   {/* {
                    this.state.status === 'pre-game' ?
                    <p>Please place on the board:</p>  :
                    this.state.status === 'game-started' ? 
                        <p>{this.state.isPlayerOneTurn ? 
                            this.state.players[0].name : 
                            this.state.players[1].name } 
                            &nbsp;, it's your turn, choose a spot to attack!
                        </p> :
                    this.state.status === 'player-won' ?
                        <p>{this.state.winner + ' '} Won the game!</p> 
                        : null
                   } */}
                 </div> 
                </div>
                <div className="boards-place">
                    {/*(My Board)Choosing ships board*/}
                    <Board 
                        boardSize={this.state.boardSize} 
                        subsConfig={this.state.subsConfig} 
                        status={this.state.status} 
                        board={this.state.players[0].board}
                        // board={current.board}
                        onClick={ (i) => this.placeSubsHandler(i)}
                        subsPlaced={this.state.subsPlaced}
                        subs={this.state.subs}
                        disabled={this.state.subsPlaced}
                        // hover={}

                    /> 
                    
                    {   !this.state.subsPlaced ?
                        <SubsToPlaceList 
                            status={this.state.status}
                            subsConfig={this.state.subsConfig}
                        /> :
                        <HistoryList 
                            history={this.state.players[0].history}
                            jumpTo={(move) => this.jumpTo(move)}
                        /> 
                    }

                    {/*Playing Board(enemy board)*/}        
                    <Board 
                        boardSize={this.state.boardSize} 
                        status={this.state.status}
                        board={current.board}
                        disabled={!this.state.subsPlaced}
                        onClick= {(i) => this.PlayingTurnHandler(i)}
                        isPlayerOneTurn={this.state.isPlayerOneTurn}
                    />    
                </div>
            </div>
        );
    }
}

export default Game;