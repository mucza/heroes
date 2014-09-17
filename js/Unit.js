Unit = function(position, size, type) {

    this.board = MyGame().getBoard();
    this.size = size;
    this.type = type;

    this.tilePosition = {
        column: null,
        row: null
    };

    Phaser.Sprite.call(this, MyGame().getGame(), position.x, position.y,
        MyGame().getGame().cache.getBitmapData(Config.unit.type[type].key));

    this.inputEnabled = true;
    this.events.onDragStop.add(this.board.stopDragUnit, this.board);
    this.events.onDragStart.add(this.board.startDragUnit, this.board);
    this.events.onInputDown.add(this.board.unitClick, this.board);
}

Unit.prototype = Object.create(Phaser.Sprite.prototype);
Unit.prototype.constructor = Unit;

Unit.prototype.show = function() {
    MyGame().getGame().add.existing(this);
};

Unit.prototype.update = function() {
    if (this.input.isDragged) {
        this.board.unitDragged(this);
    }
};

Unit.prototype.getType = function() {
    return this.type;
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

    tween.onComplete.add(this.board.stopMoveUnit, this.board);
};

Unit.prototype.disableDrag = function() {
    this.input.disableDrag();
};

Unit.prototype.enableDrag = function() {
    this.input.enableDrag(true, false, false);
};