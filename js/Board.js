Board = function() {

    this.position = {
        x: 80,
        y: 80
    };

    this.columns = [];
    this.highlightedColumnIndex = null;

    this.unitsToMoveCount = 0;
    this.reinforcement = new Reinforcement();
    this.reinforcementButton = this.addReinforcementsButton();
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

        this.addKillButton();
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
        var previousColumn = this.columns[previousTilePosition.column];
        var previousTile = previousColumn.getTile(previousTilePosition.row);

        var column = this.columns[this.highlightedColumnIndex];
        if (column.canDropUnit(unit)) {
            MyGame().setState(MyGame.STATE_MOVE, this);
            this.unitsToMoveCount = 1;
            previousColumn.unsetUnit(previousTilePosition.row);
            column.setDroppedUnit(unit);
        } else {
            unit.setPosition(previousTile.getPosition());
            MyGame().setState(MyGame.STATE_PLAYER, this);
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
        if (myGame.getState() == MyGame.STATE_MOVE) {
            if (--this.unitsToMoveCount == 0) {

                this.searchConnections();

                Util.debugUnits(this.columns);
                myGame.setState(MyGame.STATE_PLAYER, this);
            }
        } else if (myGame.getState() == MyGame.STATE_REINF_MOVE) {
            if (--this.unitsToMoveCount == 0) {
                myGame.setState(MyGame.STATE_PLAYER, this);
            }
        }

        this.reinforcementButton.setLabel(this.getUnitsToCallCount());
    },

    stopMergingWalls: function(wall) {
        console.log(wall);
    },

    searchConnections: function() {
        var attConn = this.searchAttackConnections();
        attConn.forEach( function(connection) {
            //console.log(connection);
            connection.make(this.columns);
        }, this);

        var wallConn = this.searchWallConnections();
        wallConn.forEach( function(connection) {
            //console.log(connection);
            connection.make(this.columns);
        }, this);

        this.reorderByUnitsWeight();

        var that = this;
        setTimeout(function(){that.reorderWalls();}, 500);
    },

    searchAttackConnections: function() {
        var connections = [];
        this.columns.forEach( function(column) {
            var conn = column.searchAttackConnections();
            if (conn != null) {
                connections.push(conn);
            }
        });

        return connections;
    },

    searchWallConnections: function() {
        var connections = [];
        for (var i = 0; i < Config.board.height; i++) {
            var type = null;
            var counter = 0;
            var j = Config.board.width;
            while (--j >= 0) {
                var unit = this.columns[j].getUnit(i);
                if (unit == null || !unit.isIdle()) {
                    counter = 0;
                    type = null;
                } else {
                    if (type == unit.getType()) {
                        counter++;
                    } else {
                        type = unit.getType();
                        counter = 1;
                    }
                }

                if (counter == 3) {
                    connections.push(new Connection(Connection.WALL, type, i, j, counter));
                } else if (counter > 3) {
                    connections[connections.length - 1].correct(j, counter);
                }
            }
        }

        return connections;
    },

    reorderByUnitsWeight: function() {
        this.columns.forEach( function(column) {
            column.reorderByUnitsWeight();
        });
    },

    reorderWalls: function() {
        this.columns.forEach( function(column) {
            column.reorderWalls();
        });
    },

    setUnitsDragable: function(enableDrag) {
        this.columns.forEach( function (column) {
            column.setUnitsDragable(enableDrag);
        });
    },

    unitClick: function(unit) {
        //console.log(unit.getTilePosition());

        var myGame = MyGame();
        if (myGame.getState() == MyGame.STATE_KILL) {

            var column = this.columns[unit.getTilePosition().column];
            this.unitsToMoveCount = column.unitKilled(unit);
            if (this.unitsToMoveCount == 0) {
                myGame.setState(MyGame.STATE_PLAYER, this);
                this.reinforcementButton.setLabel(this.getUnitsToCallCount());
            } else {
                myGame.setState(MyGame.STATE_MOVE, this);
            }
        }
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

    callReinforcements: function(reinforcements) {
        var reinforcementsLine = reinforcements.shift();

        reinforcementsLine.forEach( function (unit) {
            if (unit != null) {
                unit.show();
                unit.moveToTile();
            }
        });
    },

    prepareReinforcements: function() {
        var unitsToCallCount = this.getUnitsToCallCount();
        var reinforcements = this.reinforcement.prepare(this.columns, unitsToCallCount);
        this.unitsToMoveCount = reinforcements.count;

        return reinforcements.rows;
    },

    addReinforcementsButton: function() {
        var game = MyGame();
        var buttonBmp = game.add.bitmapData(40, 40);
        buttonBmp.ctx.beginPath();
        buttonBmp.ctx.rect(0, 0, 40, 40);
        buttonBmp.ctx.fillStyle = '#ff0000';
        buttonBmp.ctx.fill();

        return new LabelButton(game, 760, 120, buttonBmp, this.getUnitsToCallCount(), this.initReinforcements, this, Phaser.Keyboard.SPACEBAR);
    },

    setKillState: function() {
        var myGame = MyGame();
        if (myGame.getState() == MyGame.STATE_PLAYER) {
            myGame.setState(MyGame.STATE_KILL, this);
        } else if (myGame.getState() == MyGame.STATE_KILL) {
            myGame.setState(MyGame.STATE_PLAYER, this);
        }
    },

    addKillButton: function() {
        var game = MyGame();
        var buttonBmp = game.add.bitmapData(40, 40);
        buttonBmp.ctx.beginPath();
        buttonBmp.ctx.rect(0, 0, 40, 40);
        buttonBmp.ctx.fillStyle = '#ffff00';
        buttonBmp.ctx.fill();

        return new LabelButton(game, 760, 200, buttonBmp, 'kill', this.setKillState, this, Phaser.Keyboard.CONTROL);
    },
};