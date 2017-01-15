$(document).ready(function() {
    initGameViewModel();
    initServerGamesViewModel();
    if (!gameId) {
        $("#homepage").show();
    }
})
var gameViewModel;
var serverGamesViewModel;
// var socket = io('http://192.168.1.110');
var socket = io('https://vsknodeserver.herokuapp.com/');
var gameId = getGameId();
// console.log("gameID: ", gameId);

function getGameId() {
    return getQueryVariable("game");
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

socket.on('connect', function() {
    if (!gameId) {
        // default page

    } else {
        socket.emit("asking data", gameId);
    }

    socket.on('first-connection-' + gameId, function(data) {
        // console.log("client saved data ", data);
        if (data !== null) {
            gameViewModel.model.nameA(data.nameA);
            gameViewModel.model.nameB(data.nameB);
            gameViewModel.model.scoreA(data.scoreA);
            gameViewModel.model.scoreB(data.scoreB);
            gameViewModel.model.setScoreA(data.setScoreA);
            gameViewModel.model.setScoreB(data.setScoreB);
            gameViewModel.model.setResults(data.setResults);
            gameViewModel.model.lineUpA(data.lineUpA);
            gameViewModel.model.lineUpB(data.lineUpB);
            gameViewModel.model.positions(data.positions);
            gameViewModel.utils.initMap();
            gameViewModel.utils.afterSync();
            $("#gameFound").show();
            resizeCourt();
        } else {
            $("#gameNotFound").show();
        }
    });
    socket.on("syncGame-" + gameId, function(data) {
        // console.log("syncGame ", data);
        gameViewModel.model.scoreA(data.scoreA);
        gameViewModel.model.scoreB(data.scoreB);
        gameViewModel.model.setScoreA(data.setScoreA);
        gameViewModel.model.setScoreB(data.setScoreB);
        gameViewModel.model.setResults(data.setResults);
        gameViewModel.model.lineUpA(data.lineUpA);
        gameViewModel.model.lineUpB(data.lineUpB);
        gameViewModel.model.positions(data.positions);
        gameViewModel.utils.afterSync();
    });

    socket.on("gamesList", function(data) {
        serverGamesViewModel.model.openGames.removeAll();
        serverGamesViewModel.model.openGames.push.apply(serverGamesViewModel.model.openGames, data.open);
        serverGamesViewModel.model.endedGames.removeAll();
        serverGamesViewModel.model.endedGames.push.apply(serverGamesViewModel.model.endedGames, data.ended);
        // console.log(serverGamesViewModel.model.endedGames());
    })
});

function GameViewModelDefinition() {
    var self = this;

    self.model = {
        nameA: ko.observable(""),
        nameB: ko.observable(""),
        scoreA: ko.observable(),
        scoreB: ko.observable(),
        setScoreA: ko.observable(),
        setScoreB: ko.observable(),
        setResults: ko.observableArray(),
        lineUpA: ko.observableArray(),
        lineUpB: ko.observableArray(),
        currentSet: ko.observable(),
        scoresInTimeArray: ko.observableArray(),
        scoresInTime: ko.observableArray(),
        positions: ko.observableArray()
    };

    self.utils = {
        afterSync: function() {
            for (i = 0; i < self.model.setResults().length; i++) {
                if (self.model.setResults()[i] === null && (self.model.setScoreA() < 3 && self.model.setScoreB() < 3)) {
                    self.model.currentSet(i);
                    return;
                }
            }
        },
        initMap: function() {
            if (self.model.positions().length !== 0) {
                var uluru = {
                    lat: parseFloat(self.model.positions()[0]),
                    lng: parseFloat(self.model.positions()[1])
                }
                var map = new google.maps.Map($("#map")[0], {
                    zoom: 14,
                    center: uluru
                });
                var marker = new google.maps.Marker({
                    position: uluru,
                    map: map
                });
            }
        }
    }
}

function ServerGamesViewModelDefinition() {
    var self = this;

    self.model = {
        openGames: ko.observableArray([]),
        endedGames: ko.observableArray([])
    }
}

function initGameViewModel() {
    gameViewModel = new GameViewModelDefinition();
    ko.applyBindings(gameViewModel, $("#gameContainer")[0]);
}

function initServerGamesViewModel() {
    serverGamesViewModel = new ServerGamesViewModelDefinition();
    ko.applyBindings(serverGamesViewModel, $("#navbarWrapper")[0]);

}

function resizeCourt() {
    var $table = $(".court");
    var backrow = ($table.width() / 3) * 2;
    var frontrow = ($table.width() / 3);
    $(".back-row").height(backrow);
    $(".front-row").height(frontrow);

}

$(window).on('resize', function() {
    resizeCourt();
});
