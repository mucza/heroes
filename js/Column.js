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
            var tile = this.tiles[tileIndex].highlight(true);
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
        var unitsAbove = this.getUnitsAbove(index);
        this.unsetUnit(index);
        unit.destroy();

        unitsAbove.forEach( function(aboveUnit) {
            var unitRow = aboveUnit.getTilePosition().row;
            var newRow = this.getFirstFreeTileIndex(unitRow + 1);
            if (newRow == null) {
                return;
            }

            this.unsetUnit(unitRow);
            this.setUnit(aboveUnit, newRow);
            aboveUnit.moveToTile();
        }, this);
    },

    getUnitsAbove: function(index) {
        var result = [];
        while (index--) {
            if (this.units[index] != null) {
                result.push(this.units[index]);
            }
        }

        return result;
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
    }
};