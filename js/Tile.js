Tile = function(columnIndex, index) {
    var _columnIndex = columnIndex;
    var _index = index;

    this.sprite = null;

    this.getColumnIndex = function() {
        return _columnIndex;
    };
    this.getIndex = function() {
        return _index;
    };
};

Tile.prototype = {
    preload: function(posX, posY) {
        var game = MyGame();
        this.sprite = game.add.sprite(posX, posY, game.cache.getBitmapData('tile'));
        this.sprite.inputEnabled = true;
    },

    highlight: function(flag) {
        var color;
        if (flag) {
            color = Config.tile.highlight;
        } else {
            color = 0xffffff;
        }
        this.sprite.tint = color;
    },

    getPosition: function() {
        return {x: this.sprite.x, y: this.sprite.y};
    },

    getPositionOnBoard: function() {
        return {column: this.getColumnIndex(), row: this.getIndex()};
    }
};