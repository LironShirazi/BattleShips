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


let rooms = {};
let roomNum = 1;

io.on('connection', socket => {
        rooms = io.sockets.adapter.rooms;
        if(rooms[roomNum] && rooms[roomNum].length > 1) {  // Increase roomNum - 2 clients has joined room
                if(rooms[roomNum].length === 2) {
                    const loopTo = roomNum;
                    for(let i=1;i<=loopTo; i++) {
                        if(rooms[i].length < 2) {
                            roomNum = i;
                            break;
                        } else {
                            roomNum++; 
                            break;
                        } 
                    }
                }
            }
        socket.join(roomNum);
        console.log(rooms);

    //Tell the connecting player his player number
    socket.emit('player-number', socket.id, roomNum);
    console.log(`player ${socket.id} has connected to server.`);



    socket.once('send-room-number', (playerId, roomNum) => {
        rooms[roomNum].sockets[playerId] = false;
        let tempRoom =  {...rooms[roomNum].sockets}
        tempRoom[playerId] = { ready: tempRoom[playerId], playerNum: null}
        
        if(Object.keys(tempRoom).length === 1) {
            tempRoom[playerId].playerNum = 0;
        } else {
            tempRoom[playerId].playerNum = 1;
        }
        rooms[roomNum].sockets = tempRoom;
        io.sockets.in(roomNum).emit('player-clicked-start',rooms[roomNum].sockets);

    })

     //disconnect handler 
     socket.on('disconnect', () => {
        console.log(`player ${socket.id} disconnected form the server.`);
     });

     //update player is ready.
     socket.on('player-ready', (playerNum, roomNum) => {
        rooms[roomNum].sockets[playerNum].ready = true;
        io.sockets.in(roomNum).emit('player-clicked-ready', rooms[roomNum].sockets);
    });
        

    // receieving  player data when ready (after set ships)
    socket.on('player-data-send', (playerName, roomNum) => {
        socket.broadcast.to(roomNum).emit('retrive-enemy-data', playerName);  
    });
    //------------------ATTACK Section--------------------------------
    socket.on('attack', (i, roomNum) => {
        socket.broadcast.to(roomNum).emit('check-attack', i);
    });

    //----------------Response attack to client--------------
    socket.on('attack-response', (hitStatus, subsArrHolder, roomNum) => {
        if(subsArrHolder) {
            socket.broadcast.to(roomNum).emit('response-to-player', hitStatus, subsArrHolder);
        } else {
            socket.broadcast.to(roomNum).emit('response-to-player', hitStatus);
        }
    });

    //Win process - Game ended
    socket.on('player-lose', (winnerScore, roomNum) => {
        socket.broadcast.to(roomNum).emit('player-won', winnerScore);
        Object.keys(rooms[roomNum].sockets).forEach(player => {
            rooms[roomNum].sockets[player].ready = null;
        });
    });

    //Rematch 
    socket.on('player-rematch', (playerNum, roomNum) => {
        rooms[roomNum].sockets[playerNum].ready = false;
        if(Object.values(rooms[roomNum].sockets).every(singleConnect => singleConnect.ready === false)) {
            io.to(roomNum).emit('rematch-both');
        }
    }); 
  
});

server.listen(port, () => console.log(`listenning on port ${port}, dev mode: ${app.get('env')}`))