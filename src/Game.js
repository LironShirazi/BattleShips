import React from 'react';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import socketio from 'socket.io-client';
import hashId from './util/hashHelperFunction';
import Board from './Board';
import Sub from './Sub';
import mainLogo from './util/banner.png';
import './index.css';
import StatusLog from './components/StatusLog/StatusLog';
import SubsToPlaceList from './components/SubsToPlaceList';
import HistoryList from './components/HistoryList';


const  attackStatus = {
    MISS : 'miss',
    HIT : 'hit',
    HIT_KILLED: 'hit-killed'
}

class Game extends React.PureComponent {
    constructor() {
        super();
        this.boardSize = 100;
        this.countClicks = 0;
        this.gameId = hashId();
        this.isSubsPlacedCheck = this.isSubPlacedHandler.bind(this);
        this.boardSizeHandler = this.boardSizeHandler.bind(this);
        this.player = this.player.bind(this); 
        this.setNewGame = this.setNewGame.bind(this);
        this.clickStartGameHandler = this.clickStartGameHandler.bind(this);
        this.readyClickHandler = this.readyClickHandler.bind(this);
        this.socket = null;

        this.state = {
            players: [
                        this.player('', Array(this.boardSize).fill({value:null})),
                        this.player('opponent', Array(this.boardSize).fill({value:null})),
                    ],
            boardSize : 100,
            subsConfig : [
                { name: 'Sub', size: 4, count: 0, placed: 0 },
                { name: 'Cruiser', size: 3, count: 0, placed: 0 },
                { name: 'Destroyer', size: 2, count: 1, placed: 0 }
            ],
            subsPlaced: false,
            status: 'game-init',
            isPlayerOneTurn : false,
            winner: '',
            stepNumber: 0,
            isWinner: null 
        }
    }

    componentWillUnmount() {
        this.socket.close();
    }

    setNewGame() {
        this.setState({ status: 'waiting'});

        this.socket.emit('player-rematch', this.playerNum, this.state.roomNum);
        this.socket.once('rematch-both', () => {

            const players = this.state.players.map(player => {
                return {
                    ...player,
                    board: Array(this.state.boardSize).fill({value:null}),
                    history: [ 
                    {
                        board: Array(this.state.boardSize).fill({value:null}),
                    }
                ],
                subs: []
                }
            });
    
            this.setState({
                subsConfig : this.state.subsConfig.map(sub => {
                    return {
                        ...sub,
                        placed: 0
                    };
                }),
                status: 'pre-game',
                stepNumber: 0,
                subsPlaced: false,  
                isPlayerOneTurn: false, 
                players: players,
                isWinner: null,
                // hitStatus: ''
              });
        });
    }

    player(name, board) {
        return {
            name: name,
            playerId : hashId(),
            board: board,
            score: 0,
            subs: [],
            history: [
                {
                    board: Array(this.boardSize).fill({value:null}) 
                }
            ]
        }
    }

    jumpTo(step) {
        this.setState({
          stepNumber: step,
          isPlayerOneTurn: step % 2 !== 0
        });
      }

    loseCheck(subs) {
       return subs.every(sub => {
            if(sub.isDead) return true;
            return false;
        });
    }

    receiveAttack(i) {
        let hitStatus = '';
        let subsArrHolder;
        const playerData = {
            board: this.state.players[0].board.map(a => ({...a})), 
            subs: [...this.state.players[0].subs] 
        }
            // hit an empty square
            if(playerData.board[i].value === null) {
                playerData.board[i].value = '·';
                hitStatus = attackStatus.MISS;
      
            } else if (playerData.board[i].value === 'X') { // ship is hitted
                playerData.subs.forEach(sub => { 
                    if(sub.subCoordsArr.includes(i)) { // find the sub (and check if hitted alive ship) 
                        sub.numHits ++;
                        if (sub.getHitsLeftToDead() > 0) { // hitted ship, but not killed yet.
                            playerData.board[i].color = 'orange';
                            hitStatus = attackStatus.HIT;
                       } else {  // hitted and killed the ship
                            hitStatus = attackStatus.HIT_KILLED; 
                            subsArrHolder = [...sub.subCoordsArr];
                            sub.isDead = true;
                            sub.subCoordsArr.forEach(coord => playerData.board[coord].color = '#d73030') //view - self ship killed.
                        }
                    }
                });
            }
            this.socket.emit('attack-response', hitStatus, subsArrHolder, this.state.roomNum); // response if hitted/killed or not 

            const players = [...this.state.players];
           
            players[0].board = playerData.board;
            //player lose
            if(this.loseCheck(playerData.subs)) {
                players[1].score++; 
                this.socket.emit('player-lose', players[1].score, this.state.roomNum);
                this.setState({ 
                    players:players,
                    winner : players[1].name,
                    status:'player-won', 
                    isPlayerOneTurn: false, 
                    isWinner: false,
                    hitStatus:hitStatus
                });
            } else {
                // not lose yet - keep play
                this.setState({
                        players: players,
                        isPlayerOneTurn: true
                });
            }
    }
        
    boardSizeHandler(size) {
        const players = [...this.state.players];
        this.setState({boardSize:size*size});
        this.boardSize = size*size;

        const history = this.state.players[0].history.slice(0,this.state.stepNumber + 1);
        const current = history[history.length -1];
        let newCurrent = {board: Array(size*size).fill({value:null})};
        current.board.forEach((item, i) => {
            if(item.value)
             newCurrent[i] = item.value;
        })


        const myBoard = this.state.players[0].board.map(a => ({...a}));
        let newBoard = Array(size*size).fill({value:null});
        myBoard.forEach((item,i) => {
            if(item.value)
             newBoard[i] = item.value;
        });

        players[0].board = newBoard;
        players[0].history[history.length-1] =
        { 
              board: newCurrent.board.map(a => ({...a})) 
        }
      
        this.setState({
            players: players
        });
    }
    
    isSubPlacedHandler () {
        const isPlaced = this.state.subsConfig.every(sub => sub.count === sub.placed);
        if(isPlaced) {
            this.setState({ 
                subsPlaced: isPlaced,
                status: 'ready'
            });
        }
    }

    PlayingTurnHandler(i) {
        const history = this.state.players[0].history.slice(0,this.state.stepNumber + 1);
        const current = history[history.length -1];
        
        const board = current.board.map(a =>  ({...a}));

        if(board[i].value !== null || this.state.status ==='player-won') return; // already clicked square or game eneded.

            // send index attack to server
            this.socket.emit('attack', i, this.state.roomNum);
            this.socket.once('response-to-player',  (hitStatus, subsArrHolder) => {

                if(hitStatus === attackStatus.MISS) {
                    board[i].value = '·';
                } else if (hitStatus === attackStatus.HIT) { 
                    board[i].value = 'X';
                    board[i].color = 'orange';
                } else if(hitStatus === attackStatus.HIT_KILLED) {  // hitted and killed the ship
                    board[i].value = 'X';
                    subsArrHolder.forEach(coord => board[coord].color = '#d73030');
                }
            
            const players = [...this.state.players];
            players[0].history = history.concat([{
                board: board
            }]);
            players[1].board = board; 
            this.setState({
                    players : [
                        ...this.state.players.slice(0,1),
                        {
                            ...players[1],
                            board: board,
                        }
                    ],
                    isPlayerOneTurn: false,
                    stepNumber: players[0].history.length - 1,
                    hitStatus: hitStatus,
            });
        });
    }
    placeSubsHandler(i) {
        const boardSizeSqrt = Math.sqrt(this.state.boardSize);
        if(this.state.players[0].board[i].value !== null) return; // already caught point

        this.countClicks ++;
        if(this.countClicks === 1) {
            this.x1 = Math.floor(i/boardSizeSqrt);
            this.y1 = i%boardSizeSqrt;

        } else if (this.countClicks === 2) {
            const subsConfigHolder = [...this.state.subsConfig];
            const board = this.state.players[0].board.map(a => ({...a}));


            this.x2 = Math.floor(i/boardSizeSqrt);
            this.y2 = i%boardSizeSqrt;

            if(this.x1 === this.x2) {
               if(this.y1 === this.y2) {
                   this.countClicks = 0; 
                   return;
                } else {
                    //two legal clicks made 
                     let coords = [];
                     let createSub;
                     subsConfigHolder.some((singleSub, index, theArray) => {
                        if (singleSub.placed < singleSub.count) {
                            if ((Math.abs(this.y1 - this.y2) +1) === singleSub.size) {
                                theArray[index].placed ++;
                                
                                // ship selected from left to right on the same row click
                                let dozens = this.x1 * boardSizeSqrt;
                                if(this.y1 < this.y2 ) {
                                    for(let i=this.y1; i<=this.y2;i++) {
                                        let combinedPoint = dozens + i;
                                        board[combinedPoint].value = 'X';
                                        coords = coords.concat(combinedPoint);
                                    }
                                    createSub = new Sub(singleSub.size, coords);
                                  
                                    //ship selected from right to left on the same row
                                } else if (this.y1 > this.y2) {
                                     for(let i=this.y1; i>=this.y2; i--) {
                                         let combinedPoint = dozens + i;
                                         board[combinedPoint].value = 'X';
                                         coords = coords.concat(combinedPoint);
                                     }
                                     createSub = new Sub(singleSub.size, coords);
                                    }

                                    this.setState(({players}) => {
                                        return {
                                            players: [
                                                {
                                                ...players[0],
                                                board: board,
                                                subs: players[0].subs.concat(createSub)
        
                                            },
                                               ...players.slice(1)
                                            ]
                                        }
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
                            theArray[index].placed ++;

                            let remainder = this.y1;
                            if(this.x1 < this.x2) {
                                for(let i=this.x1; i<=this.x2; i++) {
                                    let combinedPoint = i*boardSizeSqrt + remainder;
                                    board[combinedPoint].value = 'X';
                                    coords = coords.concat(combinedPoint);
                                }
                                createSub = new Sub(singleSub.size, coords);
                            } else {
                                for(let i=this.x1; i>=this.x2; i--) {
                                    let combinedPoint = i*boardSizeSqrt + remainder;
                                    board[combinedPoint].value = 'X';
                                    coords = coords.concat(combinedPoint);
                                }
                                createSub = new Sub(singleSub.size, coords);
                            }
                            this.setState(({players}) => {
                                return {
                                    players: [
                                        {
                                        ...players[0],
                                        board: board,
                                        subs: players[0].subs.concat(createSub)

                                    },
                                       ...players.slice(1)
                                    ]
                                }
                            });
                        } else {
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

        clickStartGameHandler() {
           const playerName = prompt("Welcome to Battleship!\nPlease enter your name");
           this.socket = socketio.connect(process.env.REACT_APP_BACKEND_URL);
           this.socket.once('player-number', (num, roomNum) => {
               this.socket.emit('send-room-number', num, roomNum);
                    this.playerNum = num;
                    this.setState({ 
                        roomNum : roomNum,
                        status: 'waiting', 
                        players: [
                        {
                            ...this.state.players[0],
                            name: playerName
                        },
                        {
                            ...this.state.players[1]
                        }
                    ]
                    });
            }); 
             
            this.socket.on('player-clicked-start', (connections) => {
                let tupleConnections = Object.values(connections);
                //checkes if both players clicked start
                if(tupleConnections.every(singleConnect => singleConnect.ready === false) && tupleConnections.length === 2) {
                    this.setState({ status: 'pre-game'});
                }
            });  
       
            this.socket.on('check-attack', index => {
                this.receiveAttack(index);
            });

            this.socket.on('player-won', winnerScore => {
                const players = [...this.state.players];
                players[0].score = winnerScore;

                this.setState({
                        players: players,
                        isWinner: true,
                        status: 'player-won'
                    });
            });
        };
            
        readyClickHandler() {
            this.setState({ status: 'waiting'});
            this.socket.emit('player-ready', this.playerNum, this.state.roomNum);

            //checks if both players ready to start match (if subs placed)
            //receive enemy data and update state in players[1]
             this.socket.on('player-clicked-ready', (connections) => {

                // after set ships, sending the player data to the server (for the enemy)
                this.socket.emit('player-data-send', this.state.players[0].name, this.state.roomNum);
              
                //create player[1] update his name and create clean board for playing.
                this.socket.once('retrive-enemy-data', playerName => {

                       let players = [...this.state.players];
                       players[1].board = Array(this.state.boardSize).fill({value:null});
                       players[1].name = playerName;
                       this.setState({
                        players: players,
                        isPlayerOneTurn: connections[this.playerNum].playerNum === 0,            
                    });
                });
                    //check if both clicked 'ready' to move game start
                    let tupleConnections = Object.values(connections);
                   if(tupleConnections.every(singleConnect => singleConnect.ready === true)) {
                       this.setState({ status: 'game-started', hitStatus: ''});
                   }
            });
        }
            
    render() {
        const history = this.state.players[0].history;
        const current = history[this.state.stepNumber];

        return (
            <div className="main">
                <div className="main-header">
                    <div>
                        <img  src={mainLogo} className="logo" alt="BattleShipLOGO"/>
                    </div>

                        <h4>Please select board size</h4>
                        <div className="button-selectors">
                            <ButtonGroup color="primary" aria-label="outlined primary button group">
                                <Button value={10} onClick={(e) => this.boardSizeHandler(e.currentTarget.value)}>10X10</Button>
                                <Button value={14} onClick={(e) => this.boardSizeHandler(e.currentTarget.value)}>14X14</Button>
                            </ButtonGroup>
                        </div>
                <div className="status_log">
                    <StatusLog 
                        status={this.state.status}
                        onClickStartGame={() => this.clickStartGameHandler()}
                        onClickReady={() => this.readyClickHandler()}
                        playAgainOnClick={this.setNewGame}
                        isPlayerOneTurn={this.state.isPlayerOneTurn}
                        playerOneName={this.state.players[0].name} 
                        playerTwoName={this.state.players[1].name} 
                        winner={this.state.winner}
                        score={this.state.players[0].score}
                        enemyScore={this.state.players[1].score}
                        isWinner={this.state.isWinner}
                        hitStatus={this.state.hitStatus}
                    />
                 </div> 
                    <div className="board-header">
                        <span>My Ships</span>
                        <span>Enemy Ships</span>
                    </div>
                </div>
                <div className="boards-place">
                    <Board 
                        boardSize={this.state.boardSize} 
                        status={this.state.status} 
                        board={this.state.players[0].board}
                        onClick={ (i) => this.placeSubsHandler(i)}
                        disabled={this.state.status !== 'pre-game'}
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
                    <Board 
                        boardSize={this.state.boardSize} 
                        status={this.state.status}
                        board={current.board}
                        disabled={!this.state.isPlayerOneTurn}
                        onClick={(i) => this.PlayingTurnHandler(i)}
                        isPlayerOneTurn={this.state.isPlayerOneTurn}
                        hitStatus={this.state.hitStatus === 'hit' ? true : false}
                    />    
                </div>
            </div>
        );
    }
}

export default Game;