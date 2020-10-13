const express = require('express');
const http = require('http');
const port = process.env.PORT || 4000;
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const os = require('os');
const path = require('path');

app.use(express.static(path.join(__dirname,'..' ,'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

// const publicPath = path.join(__dirname, '..', 'public');
// app.use(express.static(publicPath));
// console.log(publicPath);

// app.use('*',  (req, res) => {
//     res.sendFile(path.join(publicPath, 'index.html'));
// });


let connections = [null, null];
// let players = [];

io.on('connection', socket => {
    //find available player number
    let playerIndex = -1;

    for(let i=0 ; i<connections.length; i++) {
        if(connections[i] === null) {
            playerIndex = i;
            break;
        }
    }

    //Tell the connecting player his player number
    socket.emit('player-number', playerIndex, os.userInfo().username);
    console.log(`player ${playerIndex} has connected to server.`);

    // setting player 
    connections[playerIndex] = false;
    
    //IGNORE player 3 
     if(playerIndex === -1) return;
    // Tell everyone what player number connected
     socket.broadcast.emit('player-connection', playerIndex);

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
            io.emit('player-clicked-ready', connections, os.userInfo().username);
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

server.listen(port, () => console.log(`listenning on port ${port}`))