function Util() {};

Util.getRandom = function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

Util.getRandomElem = function(arr) {
    var length = arr.length;
    var rand = Util.getRandom(0, length - 1);

    return arr[rand];
};

Util.maxFromArray = function(arr) {
    return Math.max.apply(Math, arr);
}