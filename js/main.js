var myGame = new MyGame({ preload: preload, create: create, render: render });

function preload () {
    myGame.initBoards();

    myGame.load.spritesheet('particles', 'img/particles_sheet.png', 16, 16, 4);
    myGame.load.spritesheet('walls', 'img/walls80AB.png', 80, 80, 24);
    myGame.load.spritesheet('gnomes', 'img/gnomes.png', 80, 80, 9);
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