Unit = function(position, size, type) {

    this.board = MyGame().getBoard();
    this.size = size;
    this._type = type;
    this.state = Unit.STATE_IDLE;

    this.master = false;

    this.tile = null;
    this.destinationTile = null;

    this._health = 1;

    Phaser.Sprite.call(this, MyGame(), position.x, position.y, 'gnomes');
    this.animationArray = [0, 1, 2, 1];
    this.animationArray.forEach(function(el, i) {
        this.animationArray[i] = el + (type * 3);
    }, this);

    this.animations.add('body', this.animationArray);
    this.animations.play('body', 5, true);

    this.inputEnabled = true;
    this.events.onDragStop.add(this.board.stopDragUnit, this.board);
    this.events.onDragStart.add(this.board.startDragUnit, this.board);
    this.events.onInputDown.add(this.board.unitClick, this.board);
};

Unit.prototype = Object.create(Phaser.Sprite.prototype);
Unit.prototype.constructor = Unit;

Unit.prototype.show = function() {
    MyGame().add.existing(this);
};

Unit.prototype.update = function() {
    if (this.input.isDragged) {
        this.board.unitDragged(this);
    }
};

Unit.prototype.getType = function() {
    return this._type;
};

Unit.prototype.getHealth = function() {
    return this._health;
};

Unit.prototype.setHealth = function(health) {
    this._health = health;
};

Unit.prototype.updateWallTexture = function() {
    this.frame = Util.getRandomWallFrame(this._health);
};

Unit.prototype.setPosition = function(position) {
    this.x = position.x;
    this.y = position.y;
};

Unit.prototype.getTile = function() {
    return this.tile;
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

Unit.prototype.moveToTile = function(mergingWalls) {
    if (this.tile == this.destinationTile || this.isTripleAttackSlave()) {
        return;
    }

    var startRow = 0;
    if (this.tile != null && this.tile.getColumnIndex() == this.destinationTile.getColumnIndex()) {
        startRow = this.tile.getIndex() + 1;
    }
    var tilesToMove = (this.destinationTile.getIndex() + 1) - startRow;
    var fallingTime = Math.abs(tilesToMove) * Config.unit.moveTimePerTile;

    var tween = MyGame().add.tween(this).to(this.destinationTile.getPosition(), fallingTime, Phaser.Easing.Linear.None, true);
    this.tile = this.destinationTile;

    mergingWalls = mergingWalls || false;
    if (mergingWalls) {
        tween.onComplete.add(this.board.stopMergingWalls, this.board);
    } else {
        tween.onComplete.add(this.board.stopMoveUnit, this.board);
    }
};

Unit.prototype.mergeWalls = function(destinationTile) {
    var destinationRow = destinationTile.getPositionOnBoard().row;
    var currentRow = this.getTilePosition().row;
    var fallingTime = Math.abs(destinationRow - currentRow) * Config.unit.moveTimePerTile;

    var tween = MyGame().add.tween(this).to(destinationTile.getPosition(), fallingTime, Phaser.Easing.Linear.None, true);

    tween.onComplete.add(this.board.stopMergingWalls, this.board);
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
    switch (state) {
        case Unit.STATE_ATTACK:
            this.events.onInputDown.remove(this.board.unitClick, this.board);

            var emitter = Util.getEmitter(Config.unit.size.width / 2, Config.unit.size.height - 10);
            this.addChild(emitter);
            emitter.start(false, 500, 50);
            break;

        case Unit.STATE_WALL:
            this.setHealth(Config.unit.wall.health);
            this.loadTexture('walls', Util.getRandomWallFrame(this._health));
            break;
    }
};

Unit.prototype.isIdle = function() {
    return this.state == Unit.STATE_IDLE;
};

Unit.prototype.getState = function() {
    return this.state;
};

//move to other class
Unit.prototype.isTripleAttack = function() {
    return this.state == Unit.STATE_ATTACK && this.size == 1;
};

Unit.prototype.isTripleAttackSlave = function() {
    return this.isTripleAttack() && !this.master;
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
    this.setState(Unit.STATE_ATTACK);
    children.forEach( function(child, i){
        child.setState(Unit.STATE_ATTACK);
        this.addChild(child);
        //position relative to master unit
        var factor = i + 1;
        if (this.board.getOrientation() === Board.ORIENTATION_UPPER) {
            factor *= -1;
        }
        var y = Config.tile.size.height * factor;
        child.setPosition({x: 0, y: y});
    }, this);
};
//------------------

Unit.STATE_IDLE = 0;
Unit.STATE_ATTACK = 1;
Unit.STATE_WALL = 2;