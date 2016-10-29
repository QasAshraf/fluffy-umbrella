var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('box', 'assets/box.png');
    game.load.spritesheet('dude', 'assets/dude.png', 32, 48);

}

var player;
var cursors;
var collidables;

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky');

    collidables = game.add.physicsGroup();

    // The player and its settings
    player = game.add.sprite(32, game.world.height - 150, 'dude');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);

    //  Our two animations, walking left and right.
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
}

function makeCollidable(x) {
    var collideable = collidables.create(x, 0, 'box')
    collideable.scale.set(0.6, 0.6)
    collideable.body.velocity.y = 100
    collideable.body.immovable = true
    collideable.checkWorldBounds = true
    collideable.rotation = Math.floor(Math.random() * 360)
    collideable.events.onOutOfBounds.add( getRidOfSprite, this )
}

function getRidOfSprite(sprite) {
    sprite.destroy()
}

function update() {

    var chance = Math.random();
    var maxCollideables = 10
    if (chance >= 0.98 && collidables.children.length < maxCollideables) {
        makeCollidable(Math.random() * game.world.width);
    }
    //  Reset the players velocity (movement)
    player.body.velocity.x = 0;

    if (cursors.left.isDown)
    {
        //  Move to the left
        player.body.velocity.x = -150;

        player.animations.play('left');
    }
    else if (cursors.right.isDown)
    {
        //  Move to the right
        player.body.velocity.x = 150;

        player.animations.play('right');
    }
    else
    {
        //  Stand still
        player.animations.stop();

        player.frame = 4;
    }

}