function MyGame(states) {
    if (arguments.callee._singletonInstance) {
        return arguments.callee._singletonInstance;
    }

    arguments.callee._singletonInstance = this;

    Phaser.Game.call(this, 800, 600, Phaser.AUTO, '', states);

    var _state = MyGame.STATE_PLAYER;
    this.getState = function() {
        return _state;
    }

    this.setState = function(state, board) {
        switch(state) {
            case MyGame.STATE_PLAYER:
                _state = MyGame.STATE_PLAYER;
                board.setUnitsDragable(true);
                break;

            case MyGame.STATE_MOVE:
                _state = MyGame.STATE_MOVE;
                board.setUnitsDragable(false);
                break;

            case MyGame.STATE_REINF:
                _state = MyGame.STATE_REINF;
                break;

            case MyGame.STATE_REINF_MOVE:
                _state = MyGame.STATE_REINF_MOVE;
                board.setUnitsDragable(false);
                break;

            case MyGame.STATE_DRAG:
                _state = MyGame.STATE_DRAG;
                break;

            case MyGame.STATE_KILL:
                _state = MyGame.STATE_KILL;
                board.setUnitsDragable(false);
                break;
        }
    }

    var _currentPlayer = MyGame.PLAYER_1;
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