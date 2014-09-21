Reinforcement = function() {
    this.calledUnitsCount = 0;
}

Reinforcement.prototype = {

    getCalledUnitsCount: function() {
        return this.calledUnitsCount;
    },

    prepare: function(columns, units, unitToCallCount) {
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

            var unitTypes = this.unitValidation(units, unitsToCall, colIndex);
            //console.log(colIndex, unitTypes);

            unitsToCall[colIndex].push(new Unit(column.getStartPosition(), 1, Util.getRandomElem(unitTypes)));

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

        //console.log(unitsToCall);

        Config.board.maxUnits += 25;

        return rowsToCall;
    },

    /*
     * checks which units color can be dropped for given column
     * returns array with acceptable unit colors
     */
    unitValidation: function(units, unitsToCall, colIndex) {
        var types = Util.getUnitTypes();
        var excludedType = this.verticalValidation(units, unitsToCall, colIndex);
        var excludedTypes = this.horizontalValidation(units, unitsToCall, colIndex);
        excludedTypes.push(excludedType);

        return Util.removeValuesFromArray(types, excludedTypes);
    },

    /*
     * return color that cannot be dropped
     */
    verticalValidation: function(units, unitsToCall, colIndex) {
        var combinedUnits = this.applyNewUnits(units[colIndex], unitsToCall[colIndex]);
        if (combinedUnits.length < 2) {
            return null;
        }

        if (combinedUnits[0].getType() != combinedUnits[1].getType()) {
            return null;
        }

        return combinedUnits[0].getType();
    },

    /*
     * return colors that cannot be dropped
     */
    horizontalValidation: function(units, unitsToCall, colIndex) {
        var combinedUnits = this.applyNewUnits(units[colIndex], unitsToCall[colIndex]);
        var raw = combinedUnits.length;

        var leftCols = this.getLeftColNeighbors(colIndex, 2);
        var rightCols = this.getRightColNeighbors(colIndex, 2);

        var leftUnits = this.getHorizontalNeighbors(units, unitsToCall, leftCols, raw, 2);
        var rightUnits = this.getHorizontalNeighbors(units, unitsToCall, rightCols, raw, 2);

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

    getHorizontalNeighbors: function(units, unitsToCall, columnsIndexes, raw, max) {
        var neighborUnits = [];
        for (var i = 0; i < columnsIndexes.length; i++) {
            var colIndex = columnsIndexes[i];
            var combinedUnits = this.applyNewUnits(units[colIndex], unitsToCall[colIndex]).reverse();
            if (combinedUnits.length > raw) {
                neighborUnits.push(combinedUnits[raw])
            } else {
                neighborUnits.push(null);
            }
        }

        if (max - columnsIndexes.length > 0) {
            for (var j = 0; j < max - columnsIndexes.length; j++) {
                neighborUnits.push(null);
            }
        }

        return neighborUnits;
    },

    applyNewUnits: function(unitsColumn, unitsToCallColumn) {
        var unitsColumnClone = Util.cloneArray(unitsColumn);
        var unitsToCallColumnClone = [];
        if (unitsToCallColumn != null) {
            unitsToCallColumnClone = Util.cloneArray(unitsToCallColumn);
        }

        var spliceCount = 0;
        unitsColumnClone.forEach(function (unit) {
            if (unit == null) {
                spliceCount++;
            } else {
                return;
            }
        });

        unitsColumnClone.splice(0, spliceCount);

        unitsToCallColumnClone.reverse();
        return unitsToCallColumnClone.concat(unitsColumnClone)
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