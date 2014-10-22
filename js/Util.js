function Util() {};

Util.getRandom = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Util.getRandomElem = function(arr) {
    var length = arr.length;
    var rand = Util.getRandom(0, length - 1);

    return arr[rand];
};


Util.getUnitTypes = function() {
    var types = [];
    for (type in Config.unit.type) {
        types.push(type);
    }

    return types;
};

Util.maxFromArray = function(arr) {
    return Math.max.apply(Math, arr);
};

/**
 * second param could be value or array of values
 */
Util.removeValuesFromArray = function(arr, values) {
    if (values == null) {
        return arr;
    }

    if (typeof values != 'object') {
        values = [values];
    }

    values.forEach( function(value) {
        if (value != null) {
            var index = arr.indexOf(value);
            if (index > -1) {
                arr.splice(index, 1);
            }
        }
    });

    return arr;
};

Util.cloneArray = function(arr) {
    return arr.slice(0);
};

Util.BMP_CIRCLE = 1;
Util.BMP_RECTANGLE = 2;

Util.addBmpToCache = function(size, color, key, type) {
    var game = MyGame();
    var bmd = game.add.bitmapData(size.width, size.height);
    bmd.ctx.fillStyle = color;

    switch(type) {
        case Util.BMP_CIRCLE:
            bmd = Util.getBmpCircle(bmd, size);
            break;

        case Util.BMP_RECTANGLE:
            bmd = Util.getBmpRectangle(bmd, size);
            break;
    }

    game.cache.addBitmapData(key, bmd);
};

Util.getBmpCircle = function(bmd, size) {
    bmd.ctx.beginPath();
    var size2 = size.width / 2;
    bmd.ctx.arc(size2, size2, size2, 0, Math.PI * 2);
    bmd.ctx.closePath();
    bmd.ctx.fill();

    return bmd;
};

Util.getBmpRectangle = function(bmd, size) {
    bmd.ctx.beginPath();
    bmd.ctx.fillRect(0, 0, size.width, size.height);
    bmd.ctx.closePath();

    return bmd;
};

Util.getEmitter = function(x, y) {
    var emitter = MyGame().add.emitter(x, y, 200);

    emitter.makeParticles('particle');
    emitter.setRotation(0, 0);
    emitter.setAlpha(0.1, 0.2);
    emitter.minParticleScale = 0.1;
    emitter.maxParticleScale = 0.2;
    emitter.gravity = -500;

    return emitter;
}

Util.debugUnits = function(columns) {
    var units = [];
    columns.forEach( function (column) {
        units.push(column.getUnits());
    });

    var debugRaws = [];
    for (var i = 0; i < Config.board.height; i++) {
        debugRaws[i] = '';
    }

    units.forEach(function (unitsCol) {
        unitsCol.forEach(function (unit, index){
            var sign;
            if (unit != null) {
                switch (unit.getState()) {
                    case Unit.STATE_IDLE:
                        switch (unit.getType()) {
                            case 'red':
                                sign = 'R'; break;
                            case 'blue':
                                sign = 'B'; break;
                            case 'green':
                                sign = 'G'; break;
                        }
                        break;

                    case Unit.STATE_WALL:
                        sign = unit.getHealth() + ''; break;

                    case Unit.STATE_ATTACK:
                        sign = 'A'; break;
                }

            } else {
                sign =  '_';
            }

            if (sign.length == 1) {
                sign += ' ';
            }

            debugRaws[index] += sign + ' ';
        });
    });

    console.log('----------');
    debugRaws.forEach(function (raw, i) {
        console.log(i + ' ' + raw);
    });
    console.log('----------');
};