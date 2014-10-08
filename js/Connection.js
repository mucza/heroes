Connection = function(type, unitType, row, column, length) {
    this.type = type;
    this.unitType = unitType;
    this.row = row;
    this.column = column;
    this.length = length || 0;
}

Connection.prototype = {

    setLength: function(length) {
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

        var parent = units[this.row + 2];
        var child1 = units[this.row + 1];
        var child2 = units[this.row];

        parent.makeTripleAttack([child1, child2]);
    },


    makeWall: function(columns) {

    }
};

Connection.TRIPLE_ATTACK = 1;
Connection.WALL = 2;