$(document).ready(function() {
    initGameViewModel();
})
var gameViewModel;
var socket = io('http://192.168.1.106');
// socket.on('news', function (data) {
//   console.log("client ", data);
//   socket.emit('my other event', { my: 'data' });
// });
socket.on('connect', function() {
    socket.on('first connection', function(data) {
        console.log("client saved data ", data);
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
    });
    socket.on('news', function(data) {
        console.log("client ", data);
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
    });
    socket.on("syncGame", function(data) {
        console.log("syncGame ", data);
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

function initGameViewModel() {
    gameViewModel = new GameViewModelDefinition();
    resizeCourt();
    ko.applyBindings(gameViewModel, $("#gameContainer")[0]);
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
