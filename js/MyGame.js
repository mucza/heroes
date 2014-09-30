function MyGame(game) {
    if (arguments.callee._singletonInstance) {
        return arguments.callee._singletonInstance;
    }

    arguments.callee._singletonInstance = this;

    var _game = game;

    this.getGame = function() {
        return _game;
    }

    var _state = this.constructor.STATE_PLAYER;

    this.getState = function() {
        return _state;
    }

    this.setState = function(state, board) {
        switch(state) {
            case this.constructor.STATE_PLAYER:
                _state = this.constructor.STATE_PLAYER;
                board.setUnitsDragable(true);
                break;

            case this.constructor.STATE_MOVE:
                _state = this.constructor.STATE_MOVE;
                board.setUnitsDragable(false);
                break;

            case this.constructor.STATE_REINF:
                _state = this.constructor.STATE_REINF;
                break;

            case this.constructor.STATE_DRAG:
                _state = this.constructor.STATE_DRAG;
                break;

            case this.constructor.STATE_KILL:
                _state = this.constructor.STATE_KILL;
                board.setUnitsDragable(false);
                break;
        }
    }

    var _currentPlayer = this.constructor.PLAYER_1;

    this.getCurrentPlayer = function() {
        return _currentPlayer;
    }

    var _boards = [];

    this.initBoards = function() {
        var board = new Board();
        board.preload();
        _boards.push(board);
    }

    this.getBoard = function() {
        return _boards[_currentPlayer];
    }
}

MyGame.STATE_PLAYER = 1;
MyGame.STATE_MOVE = 2;
MyGame.STATE_REINF = 3;
MyGame.STATE_DRAG = 4;
MyGame.STATE_KILL = 5;

MyGame.PLAYER_1 = 0;
MyGame.PLAYER_2 = 1;