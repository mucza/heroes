Connection = function(type, unitType, row, column, length) {
    this.type = type;
    this.unitType = unitType;
    this.row = row;
    this.column = column;
    this.length = length || 0;
}

Connection.prototype = {

    correct: function(column, length) {
        this.column = column;
        this.length = length;
    },

    make: function(columns) {
        switch (this.type) {
            case Connection.TRIPLE_ATTACK:
                this.makeTripleAttack(columns);
                break;

            case Connection.WALL:
                this.makeWall(columns);
                break;
        }
    },

    makeTripleAttack: function(columns) {
        var units = columns[this.column].getUnits();

        var master = units[this.row + 2];
        var child1 = units[this.row + 1];
        var child2 = units[this.row];

        master.makeTripleAttack([child1, child2]);

        //check if there's another triple attack with same unit type below this one
        var index = this.row + 3;
        if (index >= units.length) {
            return;
        }

        var unitToCheck = units[index];
        if (unitToCheck.isTripleAttack() && unitToCheck.getType() === master.getType()) {
            this.mergeTripleAttacks(master);
        }
    },

    mergeTripleAttacks: function(master) {
        var row = master.getTilePosition().row;

    },

    makeWall: function(columns) {
        var i = this.length;
        while (--i >= 0) {
            var unit = columns[this.column + i].getUnit(this.row);
            unit.setState(Unit.STATE_WALL);
        }
    }
};

Connection.TRIPLE_ATTACK = 1;
Connection.WALL = 2;