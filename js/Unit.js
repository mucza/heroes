Unit = function(position, size, type) {

    this.board = MyGame().getBoard();
    this.size = size;
    this._type = type;
    this.state = this.constructor.STATE_IDLE;

    this.master = false;

    this.tile = null;
    this.destinationTile = null;

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
    return this._type;
};

Unit.prototype.setPosition = function(position) {
    this.x = position.x;
    this.y = position.y;
};

/**
 * returns current tile position, returns destination tile if it is already set
 */
Unit.prototype.getTilePosition = function() {
	if (this.destinationTile != null && this.destinationTile != this.tile) {
		return this.destinationTile.getPositionOnBoard();
	}

    return this.tile.getPositionOnBoard();
};

Unit.prototype.setDestinationTile = function(tile) {
    this.destinationTile = tile;
};

Unit.prototype.moveToTile = function() {
    if (this.tile == this.destinationTile ||
		(this.isTripleAttack() && !this.master)) {
        return;
    }

    var startRow = 0;
    if (this.tile != null && this.tile.getColumnIndex() == this.destinationTile.getColumnIndex()) {
        startRow = this.tile.getPositionOnBoard().row + 1;
    }
    var tilesToMove = (this.destinationTile.getIndex() + 1) - startRow;
    var fallingTime = Math.abs(tilesToMove) * Config.unit.moveTimePerTile;

    var tween = MyGame().getGame().add.tween(this).to(this.destinationTile.getPosition(), fallingTime, Phaser.Easing.Linear.None, true);
    this.tile = this.destinationTile;

    tween.onComplete.add(this.board.stopMoveUnit, this.board);
};

Unit.prototype.disableDrag = function() {
    this.input.disableDrag();
};

Unit.prototype.enableDrag = function() {
    if (this.isIdle()) {
        this.input.enableDrag(true, false, false);
    }
};

Unit.prototype.setState = function(state) {
    this.state = state;
    if (state == this.constructor.STATE_ATTACK) {
        var emitter = Util.getEmitter(Config.unit.size.width / 2, Config.unit.size.height - 10);
        this.addChild(emitter);
        emitter.start(false, 500, 50);
    }
};

Unit.prototype.isIdle = function() {
    return this.state == this.constructor.STATE_IDLE;
};

Unit.prototype.getState = function() {
    return this.state;
};

//move to other class
Unit.prototype.isTripleAttack = function() {
    return this.state == this.constructor.STATE_ATTACK && this.size == 1;
};

Unit.prototype.getAllUnits = function() {
    var children;
    if (this.master) {
        children = this.children;
    } else {
        children = this.parent.children;
    }

    var units = [this];
    children.forEach( function(child) {
        if (child instanceof Unit) {
            units.push(child);
        }
    });

    return units;
};

Unit.prototype.makeTripleAttack = function(children) {
	this.master = true;
	this.setState(this.constructor.STATE_ATTACK);
	children.forEach( function(child, i){
		child.setState(this.constructor.STATE_ATTACK);
		this.addChild(child);
		//position relative to master unit
		var y = Config.tile.size.height * -(i + 1);
		child.setPosition({x: 0, y: y});
	}, this);
};
//------------------

Unit.STATE_IDLE = 0;
Unit.STATE_ATTACK = 1;
Unit.STATE_WALL = 2;