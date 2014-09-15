Tile = function(columnIndex, index) {
    var _columnIndex = columnIndex;
    var _index = index;

    this.sprite = null;
    this.unit = null;

    this.conf = {
        highlightColor: 0xff00ff
    };

    this.getColumnIndex = function() {
        return _columnIndex;
    }
    this.getIndex = function() {
        return _index;
    }
}

Tile.prototype = {
    preload: function(posX, posY, key) {
        var game = MyGame().getGame();
        this.sprite = game.add.sprite(posX, posY, game.cache.getBitmapData(key));
        this.sprite.inputEnabled = true;
    },

    highlight: function(flag) {
        var color;
        if (flag) {
            color = this.conf.highlightColor;
        } else {
            color = 0xffffff;
        }
        this.sprite.tint = color;
    },

    getUnit: function() {
        return this.unit;
    },

    setUnit: function(unit) {
        this.unit = unit;
    },

    hasUnit: function() {
        if (this.unit == null) {
            return false;
        }

        return true;
    },

    getPosition: function() {
        return {x: this.sprite.x, y: this.sprite.y};
    }
};