Unit = function(position, size, type) {

    this.board = board;
    this.size = size;
    this.type = type;

    this.tilePosition = {
        column: null,
        row: null
    };

    Phaser.Sprite.call(this, MyGame().getGame(), position.x, position.y,
        MyGame().getGame().cache.getBitmapData(Config.unit.type[type].key));

    this.inputEnabled = true;
    var board = MyGame().getBoard();
    this.events.onDragStop.add(board.stopDragUnit, board);
    this.events.onDragStart.add(board.startDragUnit, board);
    this.events.onInputDown.add(board.unitClick, board);
    //this.game.add.existing(this);
}

Unit.prototype = Object.create(Phaser.Sprite.prototype);
Unit.prototype.constructor = Unit;

Unit.prototype.show = function() {
    MyGame().getGame().add.existing(this);
};

Unit.prototype.update = function() {
    if (this.input.isDragged) {
        MyGame().getBoard().unitDragged(this);
    }
};

Unit.prototype.setPosition = function(position) {
    this.x = position.x;
    this.y = position.y;
};

Unit.prototype.getTilePosition = function() {
    return this.tilePosition;
};

Unit.prototype.setTilePosition = function(tile) {
    this.tilePosition.column = tile.getColumnIndex();
    this.tilePosition.row = tile.getIndex();
};

Unit.prototype.moveToTile = function(tile) {
    var fallingTime = (tile.getIndex() + 1) * Config.unit.moveTimePerTile;

    var tween = MyGame().getGame().add.tween(this).to(tile.getPosition(), fallingTime, Phaser.Easing.Linear.None, true);
    this.setTilePosition(tile);

    var board = MyGame().getBoard();
    tween.onComplete.add(board.stopMoveUnit, board);
};

Unit.prototype.disableDrag = function() {
    this.input.disableDrag();
};

Unit.prototype.enableDrag = function() {
    this.input.enableDrag(true, false, false);
};