Column = function(index) {
    this.index = index;
    this.tiles = [];
    this.highlightedTile = null;
}

Column.prototype = {

    addTile: function(tile, index) {
        this.tiles[index] = tile;
    },

    getTile: function(index) {
        return this.tiles[index];
    },

    highlightOn: function() {
        var tile = this.getFirstFreeTile();

        if (tile != null) {
            tile.highlight(true);
            this.highlightedTile = tile;
        }
    },

    highlightOff: function() {
        if (this.highlightedTile != null) {
            this.highlightedTile.highlight(false);
            this.highlightedTile = null;
        }
    },

    moveUnit: function(unit) {
        var destinationTile;
        //when moving unit (drag&drop)
        if (this.highlightedTile != null) {
            destinationTile = this.highlightedTile;
            unit.setPosition(this.getStartPosition());
        }
        //when calling reinforcements
        else {
            destinationTile = this.getFirstFreeTile();
        }

        destinationTile.setUnit(unit);

        unit.moveToTile(destinationTile);
    },

    getStartPosition: function() {
        var startPosition = this.tiles[0].getPosition();
        startPosition.y -= 80;

        return startPosition;
    },

    canDropUnit: function(unit) {
        var columnIndex = unit.getTilePosition().column;
        if (columnIndex != null && columnIndex == this.index) {
            return false;
        }

        return this.highlightedTile != null;
    },

    setUnitsDragable: function(enableDrag) {
        var firstTileWithUnit = true;
        this.tiles.forEach( function (tile) {
            if (tile.hasUnit()) {
                if (enableDrag && firstTileWithUnit) {
                    tile.getUnit().enableDrag();
                    firstTileWithUnit = false;
                } else {
                    tile.getUnit().disableDrag();
                }
            }
        });
    },

    getUnitsCount: function() {
        var result = 0;
        this.tiles.forEach( function (tile) {
            if (tile.hasUnit()) {
                result++;
            }
        });

        return result;
    },

    getFirstFreeTile: function() {
        var freeTile = null;
        this.tiles.forEach( function (tile) {
            if (tile.hasUnit()) {
                return freeTile;
            }

            freeTile = tile;
        });

        return freeTile;
    },

    getFreeTilesFromTop: function() {
        var result = 0;
        this.tiles.forEach( function (tile) {
            if (tile.hasUnit()) {
                return result;
            }

            result++;
        });

        return result;
    }
};