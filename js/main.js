var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, render: render });

var myGame = new MyGame(game);

function preload () {
    var types = Config.unit.type;
    for (var type in types) {
        Util.addBmpToCache(Config.unit.size, types[type].color, types[type].key, Util.BMP_CIRCLE);
    }

    myGame.initBoards();
}

function create () {
}

function render() {
    if (myGame.getState() == MyGame.STATE_REINF) {

        var reinforcements = myGame.getBoard().prepareReinforcements();

        game.time.events.repeat(Config.unit.moveTimePerTile, reinforcements.length, callReinforcements, this, reinforcements);
        myGame.setState(MyGame.STATE_MOVE, myGame.getBoard());
    }

    game.debug.text(myGame.getState(), 740, 300);
}

var total = 0;
function callReinforcements(reinforcements) {
    var reinforcementsLine = reinforcements[total];
    myGame.getBoard().callReinforcements(reinforcementsLine);

    total++;
    if (total == reinforcements.length) {
        total = 0;
    }
}