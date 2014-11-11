var Config = {
    unit: {
        moveTimePerTile: 150,
        types: ['red', 'green', 'blue'],
        size: {
            width: 80,
            height: 80
        },
        wall: {
            health: 5
        }
    },
    board: {
        maxUnits: 32,
        width: 8,
        height: 6,
        position1: {
            x: 80,
            y: 80
        },
        position2: {
            x: 80,
            y: 580
        }
    },
    tile: {
        color: '#191919',
        highlight: 0xff1919,
        size: {
            width: 80,
            height: 80
        }
    },
    timeout: 300
};