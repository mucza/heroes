var myGame = new MyGame({ preload: preload, create: create, render: render });

function preload () {
    var types = Config.unit.type;
    for (var type in types) {
        Util.addBmpToCache(Config.unit.size, types[type].color, types[type].key, Util.BMP_CIRCLE);
    }

    myGame.initBoards();

    myGame.load.image('particle', 'img/particle.png');
    myGame.load.image('wall_5', 'img/wall_5.png');
    myGame.load.image('wall_10', 'img/wall_10.png');
}

function create () {
}

function render() {
    if (myGame.getState() == MyGame.STATE_REINF) {

        var board = myGame.getBoard();
        var reinforcements = board.prepareReinforcements();

        myGame.time.events.repeat(Config.unit.moveTimePerTile, reinforcements.length, board.callReinforcements, board, reinforcements);
        myGame.setState(MyGame.STATE_REINF_MOVE, myGame.getBoard());
    }

    myGame.debug.text(myGame.getState(), 740, 300);
}