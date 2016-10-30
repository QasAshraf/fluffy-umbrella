var game = new Phaser.Game(800, 600, Phaser.AUTO, '', {preload: preload, create: create, update: update, render: render})

function addControlData(player, playerData)
{
    player.controlData = playerData;
}

function updateOrAddPlayerControl(playerData)
{
    if(!playerData)
    {
        return;
    }

    // Do we have an existing player, if so add the controller data
    if (players.hasOwnProperty(playerData.id)) {
        addControlData(players[playerData.id], playerData);
        return;
    }

    // Looks like we have a new comer
    console.log("Welcome: " + playerData.id);

    queueAddPlayer(playerData.id);
}

function preload() {
    game.load.image('road', 'assets/road.png')
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


var timer;
// Add an event listener
document.addEventListener("restartPlayer", function(e) {
    socket.emit('clientRestart', e.detail)
});
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
    "motorbike-yellow": {
        spriteName: 'motorcycle_yellow.png',
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
    "car-blue2": {
        spriteName: 'car_blue_2.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-blue3": {
        spriteName: 'car_blue_3.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-blue4": {
        spriteName: 'car_blue_4.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-blue5": {
        spriteName: 'car_blue_5.png',
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
    "car-red2": {
        spriteName: 'car_red_1.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-red3": {
        spriteName: 'car_red_2.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-red4": {
        spriteName: 'car_red_4.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-red5": {
        spriteName: 'car_red_5.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-green": {
        spriteName: 'car_green_5.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-green2": {
        spriteName: 'car_green_1.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-green3": {
        spriteName: 'car_green_2.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-green4": {
        spriteName: 'car_green_3.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-green5": {
        spriteName: 'car_green_4.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-yellow": {
        spriteName: 'car_yellow_1.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-yellow2": {
        spriteName: 'car_yellow_2.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-yellow3": {
        spriteName: 'car_yellow_3.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-yellow4": {
        spriteName: 'car_yellow_4.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    },
    "car-yellow5": {
        spriteName: 'car_yellow_5.png',
        spriteSheet: 'vehicles',
        scale: 0.8,
        rotation: false
    }
}

var playerQueue = {};

function queueAddPlayer(playerID) {
    playerQueue[playerID] = playerID;
    console.log(playerQueue);
}

function dequeueAddPlayer()
{
    console.log("Dequeueing players")
    for (var playerID in playerQueue) {
        if (playerQueue.hasOwnProperty(playerID)) {
            addPlayer(playerID) // Add them to the players
            delete playerQueue[playerID] // lets get rid of the queued fella
        }
    }
}

var current_car_index = 0

function addPlayer(playerID) {

    if(typeof playerID == 'undefined')
        return;

    console.log("Adding player " + playerID + " with colour " + current_car_index);

    var offset = 150 + (100 * Math.random()) // TODO: this needs thinking about, I dont want cars to load ontop of each other

    var cars = ['car_blue_3.png','car_black_3.png','car_green_3.png','car_red_3.png','car_yellow_3.png']

    players[playerID] = game.add.sprite(offset, game.world.height - 150, 'vehicles', cars[current_car_index])
    current_car_index = current_car_index + 1;
    if(current_car_index > cars.length - 1){
        current_car_index = 0
    }
    players[playerID].scale.x = 0.9
    players[playerID].scale.y = 0.9
    players[playerID].score = 0

    //  We need to enable physics on the players
    game.physics.arcade.enable(players[playerID])
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

    // Timer
    timer = game.time.create(false);
    timer.loop(1000, updateScores, this); // 1s timer calls updateScores
    timer.start();

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys()

    var socket = io();

    socket.on('restartPlayer', function(playerId) {
        console.log('playerId', playerId)
        console.log('players', players)
        delete players[playerId]
        console.log('players', players)
    });

    socket.on('serverUserData', function (msg) {
        if(msg)
        {
            console.log('serverUserData: ' + JSON.stringify(msg));
            updateOrAddPlayerControl(msg);
        }
    });

    socket.on('serverUserDisconnect', function(id){
        console.log('Cleanup player ' + id);
        if(players[id])
        {
            getRidOfSprite(players[id]);
            delete players[id];
        }
    })
}

function updateScores() {
    for (var playerID in players) {
        var player = players[playerID];
        if(player.alive)
        {
            player.score++
            console.log("Player " + playerID + " has score of " + player.score)
        }
    }
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
    collidable.body.velocity.y = Math.random() * (100) + 300;
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
        if (!chosenPlayer.hasSentRestart) {
            // Have to trigger an event here to pull this out into the event loop
            var event = new CustomEvent("restartPlayer", {"detail": chosenPlayer.controlData})
            document.dispatchEvent(event)
            chosenPlayer.hasSentRestart = true
        }

        explosion.play();
        explosion = game.add.sprite(player.x, game.world.centerY, 'kaboom');
        game.time.events.add(Phaser.Timer.SECOND * 1, fadeExplosion, explosion);
        player.kill()
        player = null
    })

    var chance = Math.random()
    var maxcollidables = NUMBER_OF_LANES * 2
    if (chance >= 0.97 && collidables.children.length < maxcollidables) {
        var lane = pickLane(lanes)
        makeCollidable(lane)
    }

    if (chosenPlayer.alive && typeof chosenPlayer.controlData != 'undefined') {
        chosenPlayer.body.velocity.x = chosenPlayer.controlData.accelY * 60;

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

    dequeueAddPlayer();

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

function render () {
    var y = 64;
    for (var playerID in players) {
        game.debug.text('>> ' + playerID + ': ' + players[playerID].score, 32, y);
        y = y + 32;
    }
}