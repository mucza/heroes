var myGame = new MyGame({ preload: preload, create: create, render: render });

function preload () {
    Util.addBmpToCache(Config.tile.size, Config.tile.color, 'tile', Util.BMP_RECTANGLE);
    myGame.initBoards();
    myGame.addSwitchPlayerButton();

    myGame.load.spritesheet('particles', 'img/particles_sheet.png', 16, 16, 4);
    myGame.load.spritesheet('walls', 'img/walls80AB.png', 80, 80, 24);
    myGame.load.spritesheet('gnomes', 'img/gnomes.png', 80, 80, 9);
}

function create () {
}

function render() {
    var board = myGame.getBoard();
    if (board.getState() === MyGame.STATE_REINF) {
        var reinforcements = board.prepareReinforcements();

        myGame.time.events.repeat(Config.unit.moveTimePerTile, reinforcements.length, board.callReinforcements, board, reinforcements);
        board.setState(MyGame.STATE_REINF_MOVE);
    }

    var boards = myGame.getBoards();
    myGame.debug.text(boards[MyGame.PLAYER_1].getState(), 740, 300);
    myGame.debug.text(boards[MyGame.PLAYER_2].getState(), 740, 800);
}