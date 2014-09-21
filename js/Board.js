Board = function() {

    this.position = {
        x: 80,
        y: 80
    };

    this.columns = [];
    this.highlightedColumnIndex = null;

    this.calledUnitsCount = 0;
    this.reinforcement = new Reinforcement();
}

Board.prototype = {

    preload: function() {
        var tiles = Config.tile.type;
        for (var key in tiles) {
            var tile = tiles[key];
            Util.addBmpToCache(Config.tile.size, tile.color, tile.key, Util.BMP_RECTANGLE);
        }

        for (var i = 0; i < Config.board.width; i++) {

            this.columns[i] = new Column(i);
            this.columns[i].addTiles(this.position);
        }

        this.addReinforcementsButton();
    },

    unitDragged: function(unit) {
        var colIndex = this.getColumnIndex(unit.x);
        if (this.highlightedColumnIndex != colIndex) {

            if (this.highlightedColumnIndex != null) {
                this.columns[this.highlightedColumnIndex].highlightOff();
            }

            this.highlightedColumnIndex = colIndex;
            this.columns[this.highlightedColumnIndex].highlightOn();
        }
    },

    getColumnIndex: function(unitPosX) {
        var colIndex = Math.round((unitPosX - this.position.x) / Config.tile.size.width);
        if (colIndex < 0) {
            colIndex = 0;
        } else if (colIndex >= Config.board.width) {
            colIndex = Config.board.width - 1;
        }

        return colIndex;
    },

    stopDragUnit: function(unit) {
        var previousTilePosition = unit.getTilePosition();
        var previousTile = this.columns[previousTilePosition.column].getTile(previousTilePosition.row);

        var column = this.columns[this.highlightedColumnIndex];
        if (column.canDropUnit(unit)) {
            MyGame().setState(MyGame.STATE_MOVE, this);
            previousTile.setUnit(null);
            column.moveUnit(unit);
        } else {
            MyGame().setState(MyGame.STATE_PLAYER, this);
            unit.setPosition(previousTile.getPosition());
        }

        column.highlightOff();
        this.highlightedColumnIndex = null;
    },

    startDragUnit: function(unit) {
        MyGame().setState(MyGame.STATE_DRAG, this);
    },

    /*stop move after drag&drop and after reinforcement call*/
    stopMoveUnit: function(unit) {
        var myGame = MyGame();
        if (myGame.getState() == MyGame.STATE_REINF_MOVE) {
            if (--this.calledUnitsCount == 0) {
                myGame.setState(MyGame.STATE_PLAYER, this);
            }
        } else {
            myGame.setState(MyGame.STATE_PLAYER, this);
        }
    },

    setUnitsDragable: function(enableDrag) {
        this.columns.forEach( function (column) {
            column.setUnitsDragable(enableDrag);
        });
    },

    unitClick: function(unit) {
        console.log('click');
    },

    getUnitsToCallCount: function() {
        var result = 0;
        this.columns.forEach( function (column) {
            result += column.getUnitsCount();
        });

        result = Config.board.maxUnits - result;
        if (result < 0) {
            return 0;
        }

        return result;
    },

    initReinforcements: function() {
        var myGame = MyGame();
        if (myGame.getState() == MyGame.STATE_PLAYER && this.getUnitsToCallCount() > 0) {
            myGame.setState(MyGame.STATE_REINF, this);
        }
    },

    callReinforcements: function(reinforcementsLine) {
        reinforcementsLine.forEach( function (unit, index) {
            if (unit != null) {
                unit.show();
                this.columns[index].moveUnit(unit);
            }
        }, this);
    },

    createUnitsArray: function() {
        var units = [];
        this.columns.forEach( function (column) {
            units.push(column.getUnits());
        });

        return units;
    },

    prepareReinforcements: function() {
        Util.debugUnits(this.createUnitsArray());
        var unitsToCallCount = this.getUnitsToCallCount();
        var unitsToCall = this.reinforcement.prepare(this.columns, this.createUnitsArray(), unitsToCallCount);
        this.calledUnitsCount = this.reinforcement.getCalledUnitsCount();

        return unitsToCall;
    },

    addReinforcementsButton: function() {
        var game = MyGame().getGame();
        var buttonBmp = game.add.bitmapData(40, 40);
        buttonBmp.ctx.beginPath();
        buttonBmp.ctx.rect(0, 0, 40, 40);
        buttonBmp.ctx.fillStyle = '#ff0000';
        buttonBmp.ctx.fill();

        game.add.button(740, 100, buttonBmp, this.initReinforcements, this);

        var callUnitsKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        callUnitsKey.onDown.add(this.initReinforcements, this);
    }
};