Board = function(orientation, position, state) {

    this.orientation = orientation;
    this.position = position;
    this.state = state || MyGame.STATE_INACTIVE;

    this.columns = [];
    this.highlightedColumnIndex = null;

    this.unitsToMoveCount = 0;
    this.reinforcement = new Reinforcement();
    this.reinforcementButton = this.addReinforcementsButton();
};

Board.ORIENTATION_UPPER = 0;
Board.ORIENTATION_LOWER = 1;

Board.prototype = {

    preload: function() {
        for (var i = 0; i < Config.board.width; i++) {

            this.columns[i] = new Column(i, this.orientation);
            this.columns[i].addTiles(this.position);
        }

        this.addKillButton();
    },

    getOrientation: function() {
        return this.orientation;
    },

    getState: function() {
        return this.state;
    },

    setState: function(state) {
        this.state = state;
        switch(state) {
            case MyGame.STATE_PLAYER:
                this.setUnitsDragable(true);
                break;

            case MyGame.STATE_MOVE:
            case MyGame.STATE_REINF_MOVE:
            case MyGame.STATE_KILL:
            case MyGame.STATE_INACTIVE:
                this.setUnitsDragable(false);
                break;

            case MyGame.STATE_REINF:
            case MyGame.STATE_DRAG:
                break;
        }
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
            this.setState(MyGame.STATE_MOVE);
            this.unitsToMoveCount = 1;
            previousColumn.unsetUnit(previousTilePosition.row);
            column.setDroppedUnit(unit);
        } else {
            unit.setPosition(previousTile.getPosition());
            this.setState(MyGame.STATE_PLAYER);
        }

        column.highlightOff();
        this.highlightedColumnIndex = null;
    },

    startDragUnit: function() {
        this.setState(MyGame.STATE_DRAG);
    },

    /*stop move after drag&drop and after reinforcement call*/
    stopMoveUnit: function() {
        if (this.getState() === MyGame.STATE_MOVE) {
            if (--this.unitsToMoveCount == 0) {

                this.startFlow();
            }
        } else if (this.getState() === MyGame.STATE_REINF_MOVE) {
            if (--this.unitsToMoveCount == 0) {
                this.setState(MyGame.STATE_PLAYER);
                this.reinforcementButton.setLabel(this.getUnitsToCallCount());
            }
        }
    },

    stopMergingWalls: function(wall) {
        var tilePosition = wall.getTilePosition();
        wall.destroy();
        var mergedWall = this.columns[tilePosition.column].getUnit(tilePosition.row);
        mergedWall.updateWallTexture();
    },

    startFlow: function() {
        this.searchConnections(false);
    },

    endFlow: function() {
        console.log('end flow');
        Util.debugUnits(this.columns);
        this.setState(MyGame.STATE_PLAYER);

        this.reinforcementButton.setLabel(this.getUnitsToCallCount());
    },

    searchConnections: function(callback) {
        console.log('search conn');
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

        if (wallConn.length + attConn.length > 0) {
            this.reorderByUnitsWeight();
        } else if (callback) {
            var that = this;
            setTimeout(function(){that.reorderWalls();}, Config.timeout);
        } else {
            this.endFlow();
        }
    },

    reorderByUnitsWeight: function() {
        console.log('reorder by weight');
        this.columns.forEach( function(column) {
            column.reorderByUnitsWeight();
        });

        var that = this;
        setTimeout(function(){that.searchConnections(true);}, Config.timeout);
    },

    reorderWalls: function() {
        console.log('reorder walls');
        this.columns.forEach( function(column) {
            column.reorderWalls();
        });

        var that = this;
        setTimeout(function(){that.searchConnections(false);}, Config.timeout);
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

    setUnitsDragable: function(enableDrag) {
        this.columns.forEach( function (column) {
            column.setUnitsDragable(enableDrag);
        });
    },

    unitClick: function(unit) {
        //console.log(unit.getTilePosition());

        if (this.getState() === MyGame.STATE_KILL) {

            var column = this.columns[unit.getTilePosition().column];
            this.unitsToMoveCount = column.unitKilled(unit);
            if (this.unitsToMoveCount == 0) {
                this.setState(MyGame.STATE_PLAYER);
                this.reinforcementButton.setLabel(this.getUnitsToCallCount());
            } else {
                this.setState(MyGame.STATE_MOVE);
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
        if (this.getState() === MyGame.STATE_PLAYER && this.getUnitsToCallCount() > 0) {
            this.setState(MyGame.STATE_REINF);
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

        var posY = this.position.y + 40;
        if (this.orientation === Board.ORIENTATION_LOWER) {
            posY -= 400;
        }
        return new LabelButton(game, 760, posY, buttonBmp, this.getUnitsToCallCount(), this.initReinforcements, this, Phaser.Keyboard.SPACEBAR);
    },

    setKillState: function() {
        if (this.getState() === MyGame.STATE_PLAYER) {
            this.setState(MyGame.STATE_KILL);
        } else if (this.getState() === MyGame.STATE_KILL) {
            this.setState(MyGame.STATE_PLAYER);
        }
    },

    addKillButton: function() {
        var game = MyGame();
        var buttonBmp = game.add.bitmapData(40, 40);
        buttonBmp.ctx.beginPath();
        buttonBmp.ctx.rect(0, 0, 40, 40);
        buttonBmp.ctx.fillStyle = '#ffff00';
        buttonBmp.ctx.fill();

        var posY = this.position.y + 120;
        if (this.orientation === Board.ORIENTATION_LOWER) {
            posY -= 400;
        }
        return new LabelButton(game, 760, posY, buttonBmp, 'kill', this.setKillState, this, Phaser.Keyboard.CONTROL);
    }
};