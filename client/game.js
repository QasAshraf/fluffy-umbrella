var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update })
var socket = io();

socket.on('serverUserData', function(msg){
    console.log(msg);
});

var states = {
  GAME_OVER: "GAME_OVER",
}

var state

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

var player
var cursors
var collidables
var NUMBER_OF_LANES = 6
var lanes = []
var collidableSprites = {
  'box': {
    spriteName: 'box',
    scale: 0.6
  }
}

function create() {

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE)

    //  A simple background for our game
    game.add.sprite(0, 0, 'sky')

    collidables = game.add.physicsGroup()

    // The player and its settings

    // sprite (x position, y position, atlas name, image name)
    player = game.add.sprite(300, game.world.height - 150, 'vehicles', 'car_black_1.png');

    //  We need to enable physics on the player
    game.physics.arcade.enable(player);
    
    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys()

    var divisor = game.world.width / NUMBER_OF_LANES
    for (var i = 0; i < game.world.width; i += divisor) {
      lanes.push({
        start: i,
        end: i + (divisor - 1),
        items: 0
      })
    }
}

function pickRandomCollidable() {
  var collidableSize = Object.keys(collidableSprites).length
  var collidableName = Object.keys(collidableSprites)[Math.floor(Math.random() * collidableSize)]
  return collidableSprites[collidableName]
}

function makeCollidable(lane) {
    var difference = lane.end - lane.start
    var collidableLocation = lane.start + Math.floor(Math.random() * difference)
    var randomCollidable = pickRandomCollidable()
    var collidable = collidables.create(collidableLocation, 0, randomCollidable.spriteName)

    lane.items += 1
    collidable.lane = lane
    collidable.anchor.x = 0.5
    collidable.anchor.y = 0.5
    collidable.scale.set(randomCollidable.scale, randomCollidable.scale)
    collidable.body.velocity.y = 100
    collidable.body.immovable = true
    collidable.checkWorldBounds = true
    collidable.rotation = Math.floor(Math.random() * 360)
    collidable.events.onOutOfBounds.add(getRidOfSprite, this)
}

function getRidOfSprite(sprite) {
  if (sprite.lane) {
    sprite.lane.items -= 1
  }

  sprite.destroy()
}

function update() {
  game.physics.arcade.collide(player, collidables, function (player, collidables) {
    player.kill()
    player = null
  })

  var chance = Math.random()
  var maxcollidables = 10
  if (chance >= 0.98 && collidables.children.length < maxcollidables) {
    var lane = lanes[Math.floor(Math.random() * NUMBER_OF_LANES)]
    makeCollidable(lane)
  }

  if (player.alive) {
    player.body.velocity.x = 0

    if (cursors.left.isDown) {
        player.body.velocity.x = -150
        player.animations.play('left')
    } else if (cursors.right.isDown) {
        player.body.velocity.x = 150
        player.animations.play('right')
    } else {
        player.animations.stop()
        player.frame = 4
    }
  }
}
