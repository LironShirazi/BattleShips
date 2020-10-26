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
let readyPlayers = {};
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
        // readyPlayers[roomNum][socket.id] = false;

        // rooms[roomNum].sockets[socket.id] = false; // set not ready
        console.log('readyPlayers: ' + JSON.stringify(readyPlayers));
        // const playerId = rooms[roomNum].sockets[socket.id];
        console.log('sockets '+JSON.stringify(rooms[roomNum].sockets[socket.id]));
        

        console.log(rooms);
        console.log(rooms[roomNum].length , 'roomNum' + roomNum); // num players in room
    
    //find available player number
    let playerIndex = socket.id;
    // let playerIndex = -1;


    // for(let i=0 ; i<connections.length; i++) {
    //     if(connections[i] === null) {
    //         playerIndex = i;
    //         break;
    //     }
    // }

    //Tell the connecting player his player number
    io.sockets.in(roomNum).emit('connected-to-room','You are in room'+roomNum);
    socket.emit('player-number', playerIndex, userName, roomNum);
    
    console.log(`player ${playerIndex} has connected to server.`);

    // setting player 
    // connections[playerIndex] = false;

    socket.once('send-room-number', (playerId, roomNum) => {
        rooms[roomNum].sockets[playerId] = false;
        let tempRoom =  {...rooms[roomNum].sockets}
        tempRoom[playerId] = { ready: tempRoom[playerId], playerNum: null}
        
        console.log('tempPlayer' + (Object.keys(tempRoom).length));
        console.log(' tempPlayer[playerId]'+  JSON.stringify(tempRoom[playerId]));

        if(Object.keys(tempRoom).length === 1) {
            tempRoom[playerId].playerNum = 0;
        } else {
            tempRoom[playerId].playerNum = 1;
        }
        rooms[roomNum].sockets = tempRoom;
        console.log(rooms[roomNum].sockets);
        io.sockets.in(roomNum).emit('player-clicked-start',rooms[roomNum].sockets);

    })

    // Tell everyone what player number connected

     //disconnect handler 
     socket.on('disconnect', () => {
        console.log(`player ${playerIndex} disconnected form the server.`);
        connections[playerIndex] = null;
     });

     //update player is ready.
     socket.on('player-ready', (playerNum, roomNum) => {
        console.log('[player-ready]-playerNum : ' + playerNum);
        // connections[playerNum] = true;
        rooms[roomNum].sockets[playerNum].ready = true;
        // if (connections.every(singleConnect => singleConnect === true) && connections.length === 2) {
            // io.emit('player-clicked-ready', connections, os.userInfo().username);
            // io.emit('player-clicked-ready', connections, userName);
            // io.sockets.in(roomNum).emit('player-clicked-ready',rooms[roomNum].sockets, userName);
            const turn = rooms[roomNum].sockets[playerNum].playerNum;
            console.log('turn ' + turn);
            io.sockets.in(roomNum).emit('player-clicked-ready', rooms[roomNum].sockets, userName, rooms[roomNum].sockets[playerNum].playerNum);
        // }
        console.log('rooooooooomz'+JSON.stringify(rooms));
        console.log('sockets insdite ready'+ JSON.stringify(rooms[roomNum].sockets));
    });
        

    // receieving  player data when ready (after set ships)
    socket.on('player-data-send', (playerName, playerNum, roomNum) => {
        // players[playerNum] = playerName; // [TO CHECK] - if need or not 
        io.sockets.in(roomNum).emit('retrive-enemy-data', playerName);  
        // socket.broadcast.emit('retrive-enemy-data', playerName, playerNum);
    });


    //------------------ATTACK Section--------------------------------
    socket.on('attack', (i, roomNum) => {
        socket.broadcast.to(roomNum).emit('check-attack', i);
        // socket.broadcast.emit('check-attack', i);
        console.log('inside ("attack") i : ' + i);
    });

    //----------------Response attack to client--------------
    socket.on('attack-response', (hitStatus, subsArrHolder, roomNum) => {
        if(subsArrHolder) {
            socket.broadcast.to(roomNum).emit('response-to-player', hitStatus, subsArrHolder);
        } else {
            socket.broadcast.to(roomNum).emit('response-to-player', hitStatus);
        }
        console.log('inside on("response-attack") hitStatus : ' + hitStatus);
    });

    //Win process - Game ended
    socket.on('player-lose', (winnerScore, roomNum) => {
        socket.broadcast.to(roomNum).emit('player-won', winnerScore);
        Object.keys(rooms[roomNum].sockets).forEach(player => {
            rooms[roomNum].sockets[player].ready = null;
            // console.log(JSON.stringify(rooms[roomNum].sockets));
            // console.log(player);
        });
    });

    //Rematch 
    socket.on('player-rematch', (playerNum, roomNum) => {
        rooms[roomNum].sockets[playerNum].ready = false;
        console.log(rooms[roomNum].sockets[playerNum].ready)
        if(Object.values(rooms[roomNum].sockets).every(singleConnect => singleConnect.ready === false)) {
            io.to(roomNum).emit('rematch-both');
            console.log('inside player-rematch');
        }
    }); 
  
});

server.listen(port, () => console.log(`listenning on port ${port}, dev mode: ${app.get('env')}`))