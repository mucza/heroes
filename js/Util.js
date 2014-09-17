function Util() {};

Util.getRandom = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Util.getRandomElem = function(arr) {
    var length = arr.length;
    var rand = Util.getRandom(0, length - 1);

    return arr[rand];
};

Util.getRandomKey = function(obj) {
    var arr = [];
    for (var key in obj) {
        arr.push(key);
    }

    return Util.getRandomElem(arr);
};

Util.maxFromArray = function(arr) {
    return Math.max.apply(Math, arr);
};

Util.BMP_CIRCLE = 1;
Util.BMP_RECTANGLE = 2;

Util.addBmpToCache = function(size, color, key, type) {
    var game = MyGame().getGame();
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

Util.debugUnits = function(units) {
    var debugRaws = [];
    for (var i = 0; i < Config.board.height; i++) {
        debugRaws[i] = '';
    }

    units.forEach(function (unitsCol) {
        unitsCol.forEach(function (unit, index){
            if (unit != null) {
                debugRaws[index] += 'X ';
            } else {
                debugRaws[index] += '_ ';
            }
        });
    });

    console.log('----------');
    debugRaws.forEach(function (raw) {
        console.log(raw);
    });
    console.log('----------');
};