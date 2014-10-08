var game = new Phaser.Game(1200, 600, Phaser.AUTO, '', { preload: preload, create: create, render: render });

var myGame = new MyGame(game);

function preload () {
    var types = Config.unit.type;
    for (var type in types) {
        Util.addBmpToCache(Config.unit.size, types[type].color, types[type].key, Util.BMP_CIRCLE);
    }

    myGame.initBoards();

    game.load.image('particle', 'img/particle.png');
}

function create () {

    // var emitter = Util.getEmitter();
    // emitter.start(false, 1000, 50);
}

function render() {
    if (myGame.getState() == MyGame.STATE_REINF) {

        var reinforcements = myGame.getBoard().prepareReinforcements();

        game.time.events.repeat(Config.unit.moveTimePerTile, reinforcements.length, callReinforcements, this, reinforcements);
        myGame.setState(MyGame.STATE_REINF_MOVE, myGame.getBoard());
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