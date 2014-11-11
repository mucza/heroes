function MyGame(states) {
    if (arguments.callee._singletonInstance) {
        return arguments.callee._singletonInstance;
    }

    arguments.callee._singletonInstance = this;

    Phaser.Game.call(this, 800, 600, Phaser.AUTO, '', states);

    var _state = MyGame.STATE_PLAYER;
    this.getState = function() {
        return _state;
    };

    this.setState = function(state) {
        _state = state;
        var board = this.getBoard();
        switch(_state) {
            case MyGame.STATE_PLAYER:
                board.setUnitsDragable(true);
                break;

            case MyGame.STATE_MOVE:
            case MyGame.STATE_REINF_MOVE:
            case MyGame.STATE_KILL:
                board.setUnitsDragable(false);
                break;

            case MyGame.STATE_REINF:
            case MyGame.STATE_DRAG:
                break;
        }
    };

    var _currentPlayer = MyGame.PLAYER_1;
    this.getCurrentPlayer = function() {
        return _currentPlayer;
    };

    this.switchPlayer = function() {
        if (_currentPlayer == MyGame.PLAYER_1) {
            _currentPlayer = MyGame.PLAYER_2;
        } else {
            _currentPlayer = MyGame.PLAYER_1;
        }
    };

    var _boards = [];
    this.initBoards = function() {
        var board1 = new Board(true, Config.board.position1);
        var board2 = new Board(false, Config.board.position2);
        board1.preload();
        board2.preload();
        _boards[MyGame.PLAYER_1] = board1;
        _boards[MyGame.PLAYER_2] = board2;
    };

    this.getBoard = function() {
        return _boards[_currentPlayer];
    }
}

MyGame.prototype = Object.create(Phaser.Game.prototype);
MyGame.prototype.constructor = MyGame;

MyGame.STATE_PLAYER = 1;
MyGame.STATE_MOVE = 2;
MyGame.STATE_REINF = 3;
MyGame.STATE_REINF_MOVE = 4;
MyGame.STATE_DRAG = 5;
MyGame.STATE_KILL = 6;

MyGame.PLAYER_1 = 0;
MyGame.PLAYER_2 = 1;