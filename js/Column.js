Column = function(index) {
    this.index = index;
    this.tiles = [];
    this.units = [];
    this.highlightedTileIndex = null;
}

Column.prototype = {

    addTiles: function(boardPosition) {
        for (var i = 0; i < Config.board.height; i++) {
            var tile = this.drawTile(i, boardPosition);
            this.tiles.push(tile);

            this.units.push(null);
        }
    },

    drawTile: function(row, boardPosition) {
        var col = this.index;
        var key = Config.tile.type[(col + row) % 2].key;
        var posX = col * Config.tile.size.width + boardPosition.x;
        var posY = row * Config.tile.size.height + boardPosition.y;

        var tile = new Tile(col, row);
        tile.preload(posX, posY, key);

        return tile;
    },

    getTile: function(index) {
        return this.tiles[index];
    },

    highlightOn: function() {
        var tileIndex = this.getFirstFreeTileIndex();
        if (tileIndex != null) {
            this.tiles[tileIndex].highlight(true);
            this.highlightedTileIndex = tileIndex;
        }
    },

    highlightOff: function() {
        if (this.highlightedTileIndex != null) {
            this.tiles[this.highlightedTileIndex].highlight(false);
            this.highlightedTileIndex = null;
        }
    },

    getStartPosition: function() {
        var startPosition = this.tiles[0].getPosition();
        startPosition.y -= Config.tile.size.height;

        return startPosition;
    },

    canDropUnit: function(unit) {
        var columnIndex = unit.getTilePosition().column;
        if (columnIndex != null && columnIndex == this.index) {
            return false;
        }

        return this.highlightedTileIndex != null;
    },

    moveUnits: function() {
        this.units.forEach( function(unit) {
            if (unit != null) {
                unit.moveToTile();
            }
        });
    },

    getUnits: function() {
        return this.units;
    },

    unsetUnit: function(index) {
        this.units[index] = null;
    },

    setUnit: function(unit, index) {
        unit.setDestinationTile(this.tiles[index]);
        this.units[index] = unit;
    },

    setReinforcementUnit: function(unit) {
        var index = this.getFirstFreeTileIndex();
        this.setUnit(unit, index);
    },

    setDroppedUnit: function(unit) {
        var index = this.highlightedTileIndex;
        this.setUnit(unit, index);

        unit.setPosition(this.getStartPosition());
        unit.moveToTile();
    },

    getUnit: function(index) {
        return this.units[index];
    },

    unitKilled: function(unit) {
        var index = unit.getTilePosition().row;
        this.unsetUnit(index);
        unit.destroy();

        return this.unitsFall();
    },

    unitsFall: function() {
        var unitsToMove = this.getUnitsToFall();

        unitsToMove.forEach( function(unitToMove) {
            var newRow = this.getFirstFreeTileIndex();
            if (newRow == null) {
                return;
            }

            this.shiftUnit(unitToMove, newRow);
        }, this);

        this.moveUnits();

        return unitsToMove.length;
    },

    getUnitsToFall: function() {
        var blank = null;
        var unitsToMove = [];
        var i = Config.board.height;
        while (--i >= 0) {
            var unit = this.units[i];
            if (unit == null) {
                blank = i;
            } else if (blank != null && !unit.isTripleAttackSlave()) {
                unitsToMove.push(unit);
            }
        }

        return unitsToMove;
    },

    setUnitsDragable: function(enableDrag) {
        var firstUnit = true;
        this.units.forEach( function (unit) {
            if (unit != null) {
                if (enableDrag && firstUnit) {
                    unit.enableDrag();
                    firstUnit = false;
                } else {
                    unit.disableDrag();
                }
            }
        });
    },

    getUnitsCount: function() {
        var result = 0;
        this.units.forEach( function (unit) {
            if (unit != null) {
                result++;
            }
        });

        return result;
    },

    getFirstFreeTileIndex: function(startIndex) {
        startIndex = startIndex || 0;

        var freeTileIndex = null;
        this.units.forEach( function (unit, index) {
            if (index < startIndex || unit != null) {
                return;
            }

            freeTileIndex = index;
        });

        return freeTileIndex;
    },

    getFreeTilesFromTop: function() {
        var result = 0;
        this.units.forEach( function (unit) {
            if (unit != null) {
                return;
            }

            result++;
        });

        return result;
    },

    searchAttackConnections: function() {
        var i = this.units.length;
        var counter = 0;
        var type = null;
        while (--i >= 0) {
            var unit = this.units[i];
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
                //return {type: 1, unitType: type, column: this.index, start: i};
                return new Connection(Connection.TRIPLE_ATTACK, type, i, this.index);
            }
        }

        return null;
    },

    reorderByUnitsWeight: function() {
        var needChange = true;
        while (needChange) {
            needChange = false;
            var lastWeight = Unit.STATE_IDLE;
            var lastIndex;

            for (var i = 0; i < this.units.length; i++) {
                var unit = this.units[i];
                if (unit != null) {
                    var weight = unit.getState();

                    if (weight < lastWeight) {
                        //console.log('move ' + lastIndex, lastWeight, i, weight);
                        this.moveUnitDown(lastIndex);
                        needChange = true;
                        break;
                    }

                    lastWeight = weight;
                    lastIndex = i;
                }
            }
        }

        this.moveUnits();
    },

    moveUnitDown: function(index) {
        var heavierUnit = this.units[index];
        var lighterUnit = this.units[index + 1];
        this.shiftUnit(heavierUnit, index + 1);
        if (heavierUnit.isTripleAttack()) {
            this.setUnit(lighterUnit, index - 2);
        } else {
            this.setUnit(lighterUnit, index);
        }
    },

    shiftUnit: function(unit, newIndex) {
        var index = unit.getTilePosition().row;
        if (unit.isTripleAttack()) {
            this.shiftTripleAttack(unit, newIndex);
        } else {
            this.unsetUnit(index);
            this.setUnit(unit, newIndex);
        }
    },

    shiftTripleAttack: function(unit, newIndex) {
        var diff = newIndex - unit.getTilePosition().row;
        var allUnits = unit.getAllUnits();
        allUnits.forEach( function(u) {
            var unitPos = u.getTilePosition().row;
            this.unsetUnit(unitPos);
            this.setUnit(u, unitPos + diff);
        }, this);
    },


    reorderWalls: function() {
        var i = this.units.length;
        var walls = [];
        var wallsHealth = 0;
        while (--i >= 0) {
            var unit = this.units[i];
            if (unit != null && unit.getState() == Unit.STATE_WALL) {
                walls.push( {wall: unit, startHealth: unit.getHealth()} );
                wallsHealth += unit.getHealth();
            }
        }

        var maxHealth = Config.unit.wall.health * 2;
        if (walls.length < 2 || wallsHealth > (walls.length - 1) * maxHealth) {
            return;
        }

        var healthDiffs = [];

        var healthToAdd = wallsHealth;
        for (var j = 0; j < walls.length; j++) {
            var wall = walls[j].wall;
            if (healthToAdd < 1) {
                wall.setHealth(0);
                healthDiffs[j] =  - walls[j].startHealth;
                continue;
            }

            var toAdd = Math.min(healthToAdd, maxHealth);
            wall.setHealth(toAdd);
            healthDiffs[j] = toAdd -  walls[j].startHealth;
            healthToAdd -= toAdd;
        }

        //console.log(healthDiffs);

        var transfers = [];
        var needChange = true;
        while (needChange) {
            needChange = false;

            var to = null;
            var from = null;
            var value = 0;
            for (var k = 0; k < walls.length; k++) {
                if (healthDiffs[k] > 0 && to == null) {
                    to = k;
                    value = healthDiffs[k];
                } else if (healthDiffs[k] < 0 && from == null) {
                    from = k;
                    value = Math.min(value, -1 * healthDiffs[k]);
                    healthDiffs[to] -= value;
                    healthDiffs[from] += value;

                    transfers.push( {from: k, to: to, value: value} );
                    break;
                }
            }

            if (to != null) {
                needChange = true;
            }
        }

        transfers.forEach( function(transfer) {
            var wall = walls[transfer.from].wall;
            var destinationWall = walls[transfer.to].wall;

            if (wall.getHealth() === 0) {
                this.unsetUnit(wall.getTilePosition().row);
                wall.setDestinationTile(destinationWall.getTile());
                wall.moveToTile(true);
                //wall.mergeWalls(destinationWall.getTile());
            }
        }, this);

        if (transfers.length > 0) {
            this.unitsFall();
        }

        //console.log(healthDiffs);
        //console.log(transfers);
    },
};