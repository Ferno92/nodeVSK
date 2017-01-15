var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var gameData = [];
var endedGames = [];

app.use(express.static(__dirname));
app.get('/', function(req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT || 80);

io.on('connection', function(socket) {
    socket.on('new game', function(data) {
        var id = makeid();
        io.sockets.emit("gameId", id);
        data.id = id;
        gameData.push(data);
        console.log("server from mobile", data);
        io.sockets.emit('pairing game', data);
        // io.sockets.emit('news', data);
    });
    socket.on("sync", function(syncData) {
        for (i = 0; i < gameData.length; i++) {
            if (syncData.id === gameData[i].id) {
                syncData.nameA = gameData[i].nameA;
                syncData.nameB = gameData[i].nameB;
                gameData[i] = syncData;
                io.sockets.emit("syncGame-" + syncData.id, syncData);
            }
        }
    });
    socket.on("asking data", function(id) {
        var found = false;
        console.log("asking data with id: ", id);
        for (i = 0; i < gameData.length; i++) {
            if (id === gameData[i].id) {
                found = true;
                console.log("first-connection-" + id);
                io.sockets.emit("first-connection-" + id, gameData[i]);
            }
        }
        if (!found) {
            io.sockets.emit("first-connection-" + id, null);
        }
    });
    socket.on("disconnected game", function(id) {
        for (i = 0; i < gameData.length; i++) {
            if (id === gameData[i].id) {
                var endedGame = gameData.splice(i, 1);
                endedGames.push(endedGame[0]);
                break;
            }
        }
    })
    setInterval(function() {
        var totalGames = {
            "open": gameData,
            "ended": endedGames
        };
        socket.emit('gamesList', totalGames);
    }, 1000);
});

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 5; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
