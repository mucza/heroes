var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, render: render });

var board = new Board();
var myGame = new MyGame(game);

function preload () {
    var unitColors = new Array('#ff3636', '#87c540', '#357385');
    var keys = new Array('unitRed', 'unitGreen', 'unitBlue');

    keys.forEach( function (key, i) {
        addUnitBitmapToCache(key, unitColors[i]);
    });

    board.preload(keys);
}

function create () {
}

function render() {
    if (myGame.getState() == MyGame.STATE_REINF) {

        var reinforcements = board.prepareReinforcements();

        game.time.events.repeat(Config.unit.moveTimePerTile, reinforcements.length, callReinforcements, this, reinforcements);
        myGame.setState(MyGame.STATE_REINF_MOVE, board);
    }

    game.debug.text(myGame.getState(), 740, 300);
}

var total = 0;
function callReinforcements(reinforcements) {
    var reinforcementsLine = reinforcements[total];
    board.callReinforcements(reinforcementsLine);

    total++;
    if (total == reinforcements.length) {
        total = 0;
    }
}

function addUnitBitmapToCache(key, color) {
    var bmd = game.add.bitmapData(80, 80);
    bmd.ctx.fillStyle = color;
    bmd.ctx.beginPath();
    bmd.ctx.arc(40, 40, 40, 0, Math.PI * 2);
    bmd.ctx.closePath();
    bmd.ctx.fill();

    game.cache.addBitmapData(key, bmd);
}