var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

var states = {
  GAME_OVER: "GAME_OVER",
}

var state;

function preload() {

    game.load.image('sky', 'assets/sky.png');
    game.load.image('box', 'assets/box.png');
    game.load.atlasXML(
        'vehicles',
        'assets/sprites/spritesheet_vehicles.png',
        'assets/sprites/spritesheet_vehicles.xml'
    )
    // Make game fill screen
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignVertically = true;
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
    // sprite (x position, y position, atlas name, image name)
    player = game.add.sprite(500, game.world.height - 150, 'vehicles', 'car_black_1.png');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
    
    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys();
}

function makeCollidable(x) {
    var collidable = collidables.create(x, 0, 'box')
    collidable.anchor.x = 0.5;
    collidable.anchor.y = 0.5;
    collidable.scale.set(0.6, 0.6)
    collidable.body.velocity.y = 100
    collidable.body.immovable = true
    collidable.checkWorldBounds = true
    collidable.rotation = Math.floor(Math.random() * 360)
    collidable.events.onOutOfBounds.add( getRidOfSprite, this )
}

function getRidOfSprite(sprite) {
    sprite.destroy()
}

function update() {
  game.physics.arcade.collide(player, collidables, function (player, collidables) {
    player.kill()
    player = null
  })

  var chance = Math.random();
  var maxcollidables = 10
  if (chance >= 0.98 && collidables.children.length < maxcollidables) {
      makeCollidable(Math.random() * game.world.width);
  }

  if (player.alive) {
    player.body.velocity.x = 0;

    if (cursors.left.isDown) {
        player.body.velocity.x = -150;
        player.animations.play('left');
    } else if (cursors.right.isDown) {
        player.body.velocity.x = 150;
        player.animations.play('right');
    } else {
        player.animations.stop();
        player.frame = 4;
    }
  }
}
