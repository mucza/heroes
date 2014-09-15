Board = function() {
    this.conf = {
        startX: 80,
        startY: 80,
        tileColor1: '#262f38',
        tileColor2: '#fdbd63',
        tileBmp1: 'tile1',
        tileBmp2: 'tile2'
    };
    this.unitBmpKeys = {};

    this.columns = [];
    this.highlightedColumnIndex = null;

    this.calledUnitsCount = 0;
}

Board.prototype = {

    preload: function(unitBmpKeys) {
        this.unitBmpKeys = unitBmpKeys;

        this.addTileBitmapToCache(this.conf.tileBmp1, this.conf.tileColor1);
        this.addTileBitmapToCache(this.conf.tileBmp2, this.conf.tileColor2);

        for (var i = 0; i < Config.board.width; i++) {

            this.columns[i] = new Column(i);

            for (var j = 0; j < Config.board.height; j++) {

                var tile = this.drawTile(i, j);
                this.columns[i].addTile(tile, j);
            }
        }

        this.addReinforcementsButton();
    },

    drawTile: function(col, row) {
        var key = (((col + row) % 2) == 0) ? this.conf.tileBmp1 : this.conf.tileBmp2;
        var posX = col * Config.tile.width + this.conf.startX;
        var posY = row * Config.tile.height + this.conf.startY;

        var tile = new Tile(col, row);
        tile.preload(posX, posY, key);

        return tile;
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
        var colIndex = Math.round((unitPosX - this.conf.startX) / Config.tile.width);
        if (colIndex < 0) {
            colIndex = 0;
        } else if (colIndex >= Config.board.width) {
            colIndex = Config.board.width - 1;
        }

        return colIndex;
    },

    addTileBitmapToCache: function(key, color) {
        var game = MyGame().getGame();
        var bmd = game.add.bitmapData(Config.tile.width, Config.tile.height);
        bmd.ctx.fillStyle = color;
        bmd.ctx.beginPath();
        bmd.ctx.fillRect(0, 0, Config.tile.width, Config.tile.height);
        bmd.ctx.closePath();

        game.cache.addBitmapData(key, bmd);
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
                MyGame().setState(MyGame.STATE_PLAYER, this);
            }
        } else {
            MyGame().setState(MyGame.STATE_PLAYER, this);
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

    initReinforcements: function() {
        var myGame = MyGame();
        if (myGame.getState() == MyGame.STATE_PLAYER) {
            myGame.setState(MyGame.STATE_REINF, this);
        }
    },

    prepareReinforcements: function() {
        var unitToCallCount = this.getUnitsToCallCount();
        var columnsFill = [];
        var columnsMaxFill = [];
        var availableColumns = [];
        var unitsToCall = [];

        for (var i = 0; i < Config.board.width; i++) {
            var freeTiles = this.columns[i].getFreeTilesFromTop();
            if (freeTiles > 0) {
                unitsToCall[i] = [];
                availableColumns.push(i);
            } else {
                unitsToCall[i] = null;
            }

            columnsFill.push(0);
            columnsMaxFill.push(freeTiles);
        }

        for (var j = 0; j < unitToCallCount; j++) {

            if (availableColumns.length == 0) {
                break;
            }

            var colIndex = Util.getRandomElem(availableColumns);
            var column = this.columns[colIndex];

            unitsToCall[colIndex].push(new Unit(this, column.getStartPosition(), 1, 1, Util.getRandomElem(this.unitBmpKeys)));

            columnsFill[colIndex]++;
            if (columnsFill[colIndex] == columnsMaxFill[colIndex]) {
                var index = availableColumns.indexOf(colIndex);
                availableColumns.splice(index, 1);
            }
        }

        var maxRows = Util.maxFromArray(columnsFill);
        var rowsToCall = [];

        for (var row = 0; row < maxRows; row++) {
            rowToCall = [];
            unitsToCall.forEach( function (col, i) {
                if (col != null && row in col) {
                    rowToCall.push(col[row]);
                    this.calledUnitsCount++;
                } else {
                    rowToCall.push(null);
                }
            }, this);


            rowsToCall.push(rowToCall);
        }

        Config.board.maxUnits += 10;

        return rowsToCall;
    },

    callReinforcements: function(reinforcementsLine) {
        reinforcementsLine.forEach( function (unit, index) {
            if (unit != null) {
                unit.show();
                this.columns[index].moveUnit(unit);
            }
        }, this);
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