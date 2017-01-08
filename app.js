var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var gameData = null;

app.use(express.static(__dirname));
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(80);

io.on('connection', function(socket) {
    if (gameData != null) {
        //if client log when we already have data
        socket.emit("first connection", gameData)
    }
    socket.on('new game', function(data) {
        console.log("server from mobile", data);
        gameData = data;
        io.sockets.emit('news', data);
    });
    socket.on("sync", function(syncData) {
        syncData.nameA = gameData.nameA;
        syncData.nameB = gameData.nameB;
        gameData = syncData;
        io.sockets.emit("syncGame", syncData);
    });
});
