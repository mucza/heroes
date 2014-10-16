LabelButton = function(game, x, y, key, label, callback, callbackContext, shortcutKey) {

    Phaser.Button.call(this, game, x, y, key, callback, callbackContext);

    this.style = {
        'font': 'bold 14px Arial',
        'fill': 'black'
    };
    this.label = new Phaser.Text(game, 0, 0, label, this.style);
    this.label.anchor.setTo(0.5, 0.5);
    this.addChild(this.label);

    this.anchor.setTo(0.5, 0.5);
    game.add.existing(this);

    game.input.keyboard.addKey(shortcutKey)
        .onDown.add(callback, callbackContext);
};

LabelButton.prototype = Object.create(Phaser.Button.prototype);
LabelButton.prototype.constructor = LabelButton;

LabelButton.prototype.setLabel = function(label) {
    this.label.setText(label);
};