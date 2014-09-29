Reinforcement = function() {
    this.calledUnitsCount = 0;
}

Reinforcement.prototype = {

    getCalledUnitsCount: function() {
        return this.calledUnitsCount;
    },

    prepare: function(columns, unitToCallCount) {
        this.calledUnitsCount = 0;
        var columnsFill = [];
        var columnsMaxFill = [];
        var availableColumns = [];
        var unitsToCall = [];

        for (var i = 0; i < Config.board.width; i++) {
            var freeTiles = columns[i].getFreeTilesFromTop();
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
            var column = columns[colIndex];

            var unitTypes = this.unitValidation(columns, colIndex);

            var newUnit = new Unit(column.getStartPosition(), 1, Util.getRandomElem(unitTypes));
            unitsToCall[colIndex].push(newUnit);
            column.setReinforcementUnit(newUnit);

            columnsFill[colIndex]++;
            if (columnsFill[colIndex] == columnsMaxFill[colIndex]) {
                availableColumns = Util.removeValuesFromArray(availableColumns, colIndex);
            }
        }

        var maxRows = Util.maxFromArray(columnsFill);
        var rowsToCall = [];

        for (var row = 0; row < maxRows; row++) {
            var rowToCall = [];
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

        Config.board.maxUnits += 25;

        return rowsToCall;
    },

    /*
     * checks which units color can be dropped for given column
     * returns array with acceptable unit colors
     */
    unitValidation: function(columns, colIndex) {
        var types = Util.getUnitTypes();
        var excludedType = this.verticalValidation(columns, colIndex);
        var excludedTypes = this.horizontalValidation(columns, colIndex);
        excludedTypes.push(excludedType);

       return Util.removeValuesFromArray(types, excludedTypes);
    },

    /*
     * return color that cannot be dropped
     */
    verticalValidation: function(columns, colIndex) {
        var column = columns[colIndex];
        var firstFreeIndex = column.getFirstFreeTileIndex();
        if (Config.board.height - firstFreeIndex < 3) {
            return null;
        }

        //TODO: need to change for bigger units
        if (column.getUnit(firstFreeIndex + 1).getType() != column.getUnit(firstFreeIndex + 2).getType()) {
            return null;
        }

        return column.getUnit(firstFreeIndex + 1).getType();
    },

    /*
     * return colors that cannot be dropped
     */
    horizontalValidation: function(columns, colIndex) {
        var column = columns[colIndex];
        var firstFreeIndex = column.getFirstFreeTileIndex();

        var leftCols = this.getLeftColNeighbors(colIndex, 2);
        var rightCols = this.getRightColNeighbors(colIndex, 2);

        var leftUnits = this.getHorizontalNeighbors(columns, leftCols, firstFreeIndex, 2);
        var rightUnits = this.getHorizontalNeighbors(columns, rightCols, firstFreeIndex, 2);

        var types = [];
        types.push(this.matchUnitsType(leftUnits[0], leftUnits[1]));
        types.push(this.matchUnitsType(rightUnits[0], rightUnits[1]));
        types.push(this.matchUnitsType(leftUnits[0], rightUnits[0]));

        return types;
    },

    matchUnitsType: function(unit1, unit2) {
        if (unit1 != null && unit2 != null &&
            unit1.getType() == unit2.getType()) {
            return unit1.getType();
        }

        return null;
    },

    getHorizontalNeighbors: function(columns, columnsIndexes, row, max) {
        var neighborUnits = [];

        columnsIndexes.forEach( function(colIndex) {
            neighborUnits.push(columns[colIndex].getUnit(row));
        });

        if (max - columnsIndexes.length > 0) {
            for (var j = 0; j < max - columnsIndexes.length; j++) {
                neighborUnits.push(null);
            }
        }

        return neighborUnits;
    },

    getLeftColNeighbors: function(colIndex, range) {
        var result = [];

        for (var i = 1; i <= range; i++) {
            if ((colIndex - i) >= 0) {
                result.push(colIndex - i);
            } else {
                break;
            }
        }

        return result;
    },

    getRightColNeighbors: function(colIndex, range) {
        var result = [];

        for (var i = 1; i <= range; i++) {
            if ((colIndex + i) < Config.board.width) {
                result.push(colIndex + i);
            } else {
                break;
            }
        }

        return result;
    }
}