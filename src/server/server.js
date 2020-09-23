const express = require('express');
const http = require('http');
const PORT = process.env.PORT || 4000 
const socketio = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketio(server);


let connections = [null, null];
let players = [];

io.on('connection', socket => {
    //find available player number
    let playerIndex = -1;
    for(const i in connections) {
        if(connections[i] === null) {
            playerIndex = i;
            break;
        }
    }
    
    //Tell the connecting player his player number
    socket.emit('player-number', playerIndex);
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
        connections[playerNum] = true;
        io.emit('player-clicked-ready', connections);
    });
        
    //send to player the connections array, to check if ready or clicked start game.
    // false - they are connected but not ready, 
    // true - they are ready to place subs.
    io.emit('player-clicked-start', connections, players);

    // receieving  player state when ready (after set ships)
    socket.on('player-data-send', (playerData, playerNum) => {
        players[playerNum] = playerData; // [TO CHECK] - if need or not 
            socket.broadcast.emit('retrive-enemy-data', playerData, playerNum);
            console.log(players);
    });

    

     
});

server.listen(PORT, () => console.log(`listenning on port ${PORT}`))