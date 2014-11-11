var Config = {
    unit: {
        moveTimePerTile: 150,
        type: {
            'red': {
                key: 'unitRed',
                color: '#ff3636'
            },
            'green': {
                key: 'unitGreen',
                color: '#87c540'
            },
            'blue': {
                key: 'unitBlue',
                color: '#357385'
            }
        },
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
        height: 6
    },
    tile: {
        type: {
            0: {
                key: 'tile1',
                //color: '#262f38'
                color: '#191919'
            },
            1: {
                key: 'tile2',
                //color: '#fdbd63'
                color: '#191919'
            }
        },
        size: {
            width: 80,
            height: 80
        }
    },
    timeout: 300
}