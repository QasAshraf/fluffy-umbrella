var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update})

function addControlData(player, playerData)
{
    player.controlData = playerData;
}

function update_add_player_control(playerData)
{
    if (players.hasOwnProperty(playerData.id)) {
        addControlData(players[playerData.id], playerData);
        return;
    }

    // Looks like we have created this player, must be a new comer
    console.log("Welcome: " + playerData.id);

    addPlayer(playerData.id);
    addControlData(players[playerData.id], playerData);
}

function preload() {
    game.load.image('road', 'assets/road.png')
    game.load.image('sky', 'assets/sky.png')
    game.load.image('box', 'assets/box.png')
    game.load.atlasXML(
        'vehicles',
        'assets/sprites/spritesheet_vehicles.png',
        'assets/sprites/spritesheet_vehicles.xml'
    )

    // Explosions!
    game.load.image('kaboom', 'assets/explosion.png', 64, 64);
    game.load.audio('explosion', 'assets/explosion.wav');

    // Make game fill screen
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignVertically = true;
    game.scale.pageAlignHorizontally = true;
}

var explosion
var player
var players = {}
var cursors
var collidables
var NUMBER_OF_LANES = 6
var lanes = []
var collidableSprites = {
    "motorbike-blue": {
        spriteName: 'motorcycle_blue.png',
        spriteSheet: 'vehicles',
        scale: 0.6,
        rotation: false
    },
    "motorbike-red": {
        spriteName: 'motorcycle_red.png',
        spriteSheet: 'vehicles',
        scale: 0.6,
        rotation: false
    },
    "motorbike-green": {
        spriteName: 'motorcycle_green.png',
        spriteSheet: 'vehicles',
        scale: 0.6,
        rotation: false
    },
    "car-blue": {
        spriteName: 'car_blue_1.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-red": {
        spriteName: 'car_red_3.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-green": {
        spriteName: 'car_green_5.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    }
}

function addPlayer(playerID) {

    var offset = 100 + (100 * Math.random()) // TODO: this needs thinking about, I dont want cars to load ontop of each other

    players[playerID] = game.add.sprite(offset, game.world.height - 150, 'vehicles', 'car_black_3.png');
    players[playerID].scale.x = 0.9
    players[playerID].scale.y = 0.9

    //  We need to enable physics on the players
    game.physics.arcade.enable(players[playerID]);
}

function create() {
    var divisor = game.world.width / NUMBER_OF_LANES
    for (var i = 0; i < game.world.width; i += divisor) {
      lanes.push({
        start: i,
        end: i + (divisor - 1),
        items: 0
      })
    }

    lanes.forEach(function (lane) {
        var laneSprite = game.add.sprite(lane.start, -200, 'road')
        laneSprite.scale.x = ((lane.end - lane.start) / laneSprite.width) + 0.02 // get rid of weird black lines :/
        laneSprite.scale.y = 2.5
        lane.laneSprite = laneSprite
    })

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE)

    // Audio
    explosion = game.add.audio('explosion');

    collidables = game.add.physicsGroup()


    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys()

    var socket = io();
    socket.on('serverUserData', function (msg) {
        console.log(msg);
        update_add_player_control(msg);
    });
}

function pickLane(lanes) {
    return lanes.reduce(function (a, b) {
        return a.items > b.items ? b : a
    })
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

    if (randomCollidable.spriteSheet) {
        var collidable = collidables.create(collidableLocation, 0, randomCollidable.spriteSheet, randomCollidable.spriteName)
    } else {
        var collidable = collidables.create(collidableLocation, 0, randomCollidable.spriteName)
    }


    lane.items += 1
    collidable.lane = lane
    collidable.anchor.x = 0.5
    collidable.anchor.y = 0.5
    collidable.scale.set(randomCollidable.scale, randomCollidable.scale)
    collidable.body.velocity.y = Math.random() * (400) + 300;
    collidable.body.immovable = false
    collidable.checkWorldBounds = true
    collidable.rotation = randomCollidable.rotation ? Math.random(0, 360) : 0
    collidable.events.onOutOfBounds.add(getRidOfSprite, this)
}

function getRidOfSprite(sprite) {
    if (sprite.lane) {
        sprite.lane.items -= 1
    }

    sprite.destroy()
}

function fadeExplosion() {
    game.add.tween(explosion).to({ alpha: 0 }, 2000, Phaser.Easing.Elastic.In, true);
    explosion.kill()
}

function updatePlayer(chosenPlayer) {
    game.physics.arcade.collide(chosenPlayer, collidables, function (player, collidables) {
        explosion.play();
        explosion = game.add.sprite(player.x, game.world.centerY, 'kaboom');
        game.time.events.add(Phaser.Timer.SECOND * 1, fadeExplosion, explosion);
        player.kill()
        player = null
    })

    var chance = Math.random()
    var maxcollidables = NUMBER_OF_LANES * 2
    if (chance >= 0.94 && collidables.children.length < maxcollidables) {
        var lane = pickLane(lanes)
        makeCollidable(lane)
    }

    if (chosenPlayer.alive) {
        chosenPlayer.body.velocity.x = chosenPlayer.controlData.accelY * 30;

        if (chosenPlayer.controlData.accelY > 0)
            chosenPlayer.animations.play('left')
        else
            chosenPlayer.animations.play('right')

        // Maybe we are testing with arrow keys
        if (cursors.left.isDown) {
            chosenPlayer.body.velocity.x = -300
            chosenPlayer.animations.play('left')
        } else if (cursors.right.isDown) {
            chosenPlayer.body.velocity.x = 300
            chosenPlayer.animations.play('right')
        } else {
            chosenPlayer.animations.stop()
            chosenPlayer.frame = 4
        }
    }
}

function update() {

    lanes.forEach(function (lane) {
        lane.laneSprite.y += 8 //speed of road
        if (lane.laneSprite.y >= 0) lane.laneSprite.y = -151 // Yes, I hate myself.
    })

    for (var playerID in players) {
        if (players.hasOwnProperty(playerID)) {
            updatePlayer(players[playerID])
        }
    }
}
