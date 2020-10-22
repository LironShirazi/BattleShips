const express = require('express');
const http = require('http');
const port = process.env.PORT || 4000;
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const path = require('path');
const compression = require('compression');
const morgan = require('morgan');


const dev = app.get('env') !== 'production';
if(!dev) {
    app.use(compression());
    app.use(morgan('common'));

    app.use(express.static(path.join(__dirname,'..' ,'build')));
    
    app.get('/', (req, res) => {
      res.sendFile(path.join(__dirname, 'build', 'index.html'));
    });
} 
// if(dev) {
//     // app.use(express.static(path.join(__dirname,'..' ,'build')));
//     app.use(morgan('dev'));
// }

const userName = 'Player';
let connections = [null, null];
let rooms = {};
let roomNum = 1;

io.on('connection', socket => {
    // if(rooms[roomNum].length < 2) {
    
        rooms = io.sockets.adapter.rooms;
        if(rooms[roomNum] && rooms[roomNum].length > 1) {  // Increase roomNum - 2 clients has joined room
                //check if there is a place in any existing room.
                if(rooms[roomNum].length === 2) {
                    const loopTo = roomNum;
                    for(let i=1;i<=loopTo; i++) {
                        console.log('room num is: ' +roomNum);
                        if(rooms[i].length < 2) {
                            roomNum = i;
                            console.log('rooms[i]'+ rooms[i].length)
                            break;
                        } else {
                            roomNum++; 
                            break;
                        } 
                    }
                }
            }
        socket.join(roomNum);

        rooms[roomNum].sockets[socket.id] = false; // set not ready
        console.log(rooms[roomNum][socket.id]);
        

        console.log(rooms);
        console.log(rooms[roomNum].length , 'roomNum' + roomNum); // num players in room
    
    //find available player number
    let playerIndex = -1;

    // for(let i=0 ; i<connections.length; i++) {
    //     if(connections[i] === null) {
    //         playerIndex = i;
    //         break;
    //     }
    // }

    //Tell the connecting player his player number
    io.sockets.in(roomNum).emit('connected-to-room','You are in room'+roomNum )
    socket.emit('player-number', playerIndex, userName, roomNum);
    
    console.log(`player ${playerIndex} has connected to server.`);

    // setting player 
    connections[playerIndex] = false;
    

     
    // Tell everyone what player number connected
    //  socket.broadcast.emit('player-connection', playerIndex);

     //disconnect handler 
     socket.on('disconnect', () => {
        console.log(`player ${playerIndex} disconnected form the server.`);
        connections[playerIndex] = null;

     });

     //update player is ready.
     socket.on('player-ready', playerNum => {
        console.log('[player-ready]-playerNum : ' + playerNum);
        connections[playerNum] = true;
        if (connections.every(singleConnect => singleConnect === true) && connections.length === 2) {
            // io.emit('player-clicked-ready', connections, os.userInfo().username);
            io.emit('player-clicked-ready', connections, userName);
            console.log('userName is: ' + userName);
        }
    });
        
    //send to player the connections array, to check if ready or clicked start game.
    // false - they are connected but not ready, 
    // true - they are ready to place subs.
    io.emit('player-clicked-start', connections);

    // receieving  player data when ready (after set ships)
    socket.on('player-data-send', (playerName, playerNum) => {
        // players[playerNum] = playerName; // [TO CHECK] - if need or not 
            socket.broadcast.emit('retrive-enemy-data', playerName, playerNum);
    });


    //------------------ATTACK Section--------------------------------
    socket.on('attack', i => {
        socket.broadcast.emit('check-attack', i);
        console.log('inside ("attack") i : ' + i);
    });

    //----------------Response attack to client--------------
    socket.on('attack-response', (hitStatus, subsArrHolder) => {
        if(subsArrHolder) {
        socket.broadcast.emit('response-to-player', hitStatus, subsArrHolder);
        } else {
            socket.broadcast.emit('response-to-player', hitStatus);
        }
        console.log('inside on("response-attack") hitStatus : ' + hitStatus);
    })

    //Win process - Game ended
    socket.on('player-lose', winnerScore => {
        socket.broadcast.emit('player-won', winnerScore);
        connections = [null, null];
        console.log('winnerScore', winnerScore);
    });

    //Rematch 
    socket.on('player-rematch', playerNum => {
        connections[playerNum] = false;
        if (connections.every(singleConnect => singleConnect === false)) {
            io.emit('rematch-both');
            console.log('inside player-rematch');
        }
    }); 
  
});

server.listen(port, () => console.log(`listenning on port ${port}, dev mode: ${app.get('env')}`))