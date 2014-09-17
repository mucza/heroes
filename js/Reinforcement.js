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

            unitsToCall[colIndex].push(new Unit(column.getStartPosition(), 1, Util.getRandomKey(Config.unit.type)));

            columnsFill[colIndex]++;
            if (columnsFill[colIndex] == columnsMaxFill[colIndex]) {
                var index = availableColumns.indexOf(colIndex);
                availableColumns.splice(index, 1);
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

        Config.board.maxUnits += 10;

        return rowsToCall;
    },

    verticalValidation: function() {

    }
}