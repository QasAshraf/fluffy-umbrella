var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {preload: preload, create: create, update: update, render: render})
var socket;

ion.sound({
    sounds: [
        {
            name: "bgmusic",
            path: "assets/",
        }
    ],
    volume: 1,
    loop: true,
    preload: true
});

var bgMusicPlaying = false;


function addControlData(player, playerData)
{
    player.controlData = playerData;
}

function addPlayerText(player) {
    var style = {
        fill: '#fff',
        align: 'center'
    }

    player.textSprite = game.add.text(player.car.body.x, player.car.body.y + 120, player.car.controlData.name, style)
}

function updateOrAddPlayerControl(playerData)
{
    if(!playerData)
    {
        return;
    }

    // Do we have an existing player, if so add the controller data
    if (players.hasOwnProperty(playerData.id)) {
        addControlData(players[playerData.id].car, playerData);

        if (!players[playerData.id].textSprite) {
            addPlayerText(players[playerData.id])
        }

        return;
    }

    // Looks like we have a new comer
    console.log("Welcome: " + playerData.id);

    addPlayer(playerData.id);
}

function preload() {
    game.load.image('road', 'assets/road.png')
    game.load.image('box', 'assets/box.png')
    game.load.atlasXML(
        'vehicles',
        'assets/sprites/spritesheet_vehicles.png',
        'assets/sprites/spritesheet_vehicles.xml'
    )
    game.load.atlasXML(
        'objects',
        'assets/sprites/spritesheet_objects.png',
        'assets/sprites/spritesheet_objects.xml'
    )

    // Explosions!
    game.load.image('kaboom', 'assets/explosion.png', 64, 64);
    game.load.audio('explosion', 'assets/explosion.wav');

    // Make game fill screen
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    //game.scale.pageAlignVertically = true;
    //game.scale.pageAlignHorizontally = true;
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
var collectibles
var NUMBER_OF_LANES = 6
var lanes = []

var collectibleSprites = {
    "cone": {
        spriteName: 'cone_down.png',
        spriteSheet: 'objects',
        scale: 0.6,
        rotation: true,
        action: addBonusScore
    },
    "cone2": {
        spriteName: 'cone_straight.png',
        spriteSheet: 'objects',
        scale: 0.6,
        rotation: true,
        action: addBonusScore
    }

}
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

var current_car_index = 0

function addBonusScore(player, collectible) {
    player.score += Math.round(Math.random() * (48) + 2); // 2 - 50
}

function addPlayer(playerID) {

    if(typeof playerID == 'undefined')
        return;

    console.log("Adding player " + playerID + " with colour " + current_car_index);

    var offset = 150 + (100 * Math.random()) // TODO: this needs thinking about, I dont want cars to load ontop of each other

    var cars = ['car_black_3.png','car_blue_3.png','car_green_3.png','car_red_3.png','car_yellow_3.png']

    players[playerID] = {}
    players[playerID].car = game.add.sprite(offset, game.world.height - 150, 'vehicles', cars[current_car_index])

    var player = players[playerID].car

    current_car_index = current_car_index + 1;
    if(current_car_index > cars.length - 1){
        current_car_index = 0
    }

    player.anchor.set(0.5);
    player.scale.x = 0.9
    player.scale.y = 0.9
    player.score = 0
    player.invincible = true
    player.alpha = 0.3;

    game.time.events.add(Phaser.Timer.SECOND * 3, function () {
        if(typeof players[playerID].car != 'undefined') {
            player.invincible = false
            player.alpha = 1;
        }
    }, this);

    //  We need to enable physics on the players
    game.physics.arcade.enable(players[playerID].car)
    
    if(!bgMusicPlaying) {
        ion.sound.play("bgmusic");
        bgMusicPlaying = true;
    }

    player.body.setSize(player.width - 25, player.height, 15);
    player.body.collideWorldBounds = true
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

    var style = { font: "60px Arial", fill: "#ffffff", align: "center" };
    var text = game.add.text(game.world.centerX, game.world.centerY, "M60 Mayhem\nConnect a controller to start", style);
    text.anchor.set(0.5);
    text.alpha = 0.1;

    game.add.tween(text).to( { alpha: 1 }, 2000, "Linear", true);

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE)

    // Audio
    explosion = game.add.audio('explosion');

    collidables = game.add.physicsGroup()
    collectibles = game.add.physicsGroup()

    // Timer
    timer = game.time.create(false);
    timer.loop(1000, updateScores, this); // 1s timer calls updateScores
    timer.start();

    //  Our controls.
    cursors = game.input.keyboard.createCursorKeys()

    socket = io();

    socket.on('restartPlayer', function(playerId) {
        console.log('playerId', playerId)
        console.log('players', players)
        delete players[playerId]
        console.log('players', players)
    });

    socket.on('serverUserData', function (msg) {
        if (text != undefined) {
            text.destroy()
        }
        if(msg)
        {
            updateOrAddPlayerControl(msg);
        }
    });

    socket.on('serverUserDisconnect', function(id){
        console.log('Cleanup player ' + id);
        if(players[id])
        {
            getRidOfSprite(players[id].car);
            delete players[id];
        }
    })
}

function clearDebugText()
{
    game.debug.text('No players', 32, 32);
}

function updateScores() {
    for (var playerID in players) {
        var player = players[playerID].car;
        if(player.alive && !player.invincible)
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

function pickRandomMovingSprite(spriteList) {
    var spriteListSize = Object.keys(spriteList).length
    var spriteName = Object.keys(spriteList)[Math.floor(Math.random() * spriteListSize)]
    return spriteList[spriteName]
}

function makeMovingSprite(lane, isCollectible) {
    var difference = lane.end - lane.start
    var location = lane.start + Math.floor(Math.random() * difference)
    var spriteResourceList = isCollectible ? collectibleSprites: collidableSprites;
    var spriteList = isCollectible ? collectibles: collidables;
    var randomSprite = pickRandomMovingSprite(spriteResourceList)

    var sprite;
    if (randomSprite.spriteSheet) {
        sprite = spriteList.create(location, 0, randomSprite.spriteSheet, randomSprite.spriteName)
    } else {
        sprite = spriteList.create(location, 0, randomSprite.spriteName)
    }

    lane.items += 1
    sprite.lane = lane
    sprite.anchor.x = 0.5
    sprite.anchor.y = 0.5
    sprite.scale.set(randomSprite.scale, randomSprite.scale)
    sprite.body.velocity.y = Math.random() * (100) + 300;
    sprite.body.immovable = false
    sprite.checkWorldBounds = true
    sprite.rotation = randomSprite.rotation ? Math.random(0, 360) : 0
    sprite.events.onOutOfBounds.add(getRidOfSprite, this)
    sprite.colisionAction = randomSprite.action
}

function getRidOfSprite(sprite) {
    if (sprite.lane) {
        sprite.lane.items -= 1
    }

    sprite.destroy()
}

function cleanUpExplosion()
{
    explosions[this].destroy();
}

var explosions = {}

function killPlayerIfCrashed(chosenPlayer) {
    game.physics.arcade.collide(chosenPlayer.car, collidables, function (player) {
        if (!chosenPlayer.car.hasSentRestart) {
            // Have to trigger an event here to pull this out into the event loop
            var event = new CustomEvent("restartPlayer", {"detail": player.controlData})
            document.dispatchEvent(event)
            player.hasSentRestart = true
        }

        explosion.play();

        explosions[player] = game.add.sprite(player.x, game.world.centerY + 20, 'kaboom');
        explosions[player].lifespan = 500
        explosions[player].x = player.x - (explosions[player].width / 2)

        updateLeaderBoard(player);
        chosenPlayer.textSprite.kill()
        player.kill()
        player = null
    })
}

var leaderboard = {};

function updateLeaderBoard(player) {

    console.log("Try the leaderboard");
    console.log(player);

    if(typeof player.controlData == "undefined" || !player.controlData.name)
        return;

    if(typeof leaderboard[player.controlData.id] != "undefined")
    {
        // Already has a high score, compare
        if(leaderboard[player.controlData.id].score < player.score) {
            leaderboard[player.controlData.id].score = player.score;
            leaderboard[player.controlData.id].name = player.controlData.name;
        }
    }
    else {
        // No Score yet, add it
        leaderboard[player.controlData.id] = {};
        leaderboard[player.controlData.id].score = player.score;
        leaderboard[player.controlData.id].name = player.controlData.name;
    }

    var leadersString = "";
    for (var playerID in leaderboard) {
        if (leaderboard.hasOwnProperty(playerID)) {
            leadersString += "<span class='leadername'> " + leaderboard[playerID].name + "</span> <span class='leaderscore'>" + leaderboard[playerID].score + "</span></br>";
        }
    }

    console.log(leadersString);

    document.getElementById("high-scores").innerHTML = leadersString;
}

function collectCollectible(chosenPlayer) {
    game.physics.arcade.overlap(chosenPlayer.car, collectibles, function (player, collectible) {
        if(player.alive)
        {
            collectible.destroy()
            collectible.colisionAction(player, collectible)
        }
    })
}

function updatePlayer(chosenPlayer) {
    if (!chosenPlayer.car.invincible) {
        killPlayerIfCrashed(chosenPlayer);
        collectCollectible(chosenPlayer);
    }

    var chance = Math.random()
    var maxcollidables = NUMBER_OF_LANES * 2
    if (chance >= 0.97 && collidables.children.length < maxcollidables) {
        var lane = pickLane(lanes)
        makeMovingSprite(lane, false)
    }

    //re-roll the dice
    chance = Math.random()
    if (chance >= 0.99) {
        var lane = pickLane(lanes)
        makeMovingSprite(lane, true)
    }

    if (chosenPlayer.car.alive && typeof chosenPlayer.car.controlData != 'undefined') {
        chosenPlayer.car.body.velocity.x = chosenPlayer.car.controlData.accelY * 60;
        chosenPlayer.car.angle = chosenPlayer.car.controlData.accelY; // we have between -10 .. +10 acella data

        // Maybe we are testing with arrow keys
        if (cursors.left.isDown) {
            chosenPlayer.car.body.velocity.x = -300
        } else if (cursors.right.isDown) {
            chosenPlayer.car.body.velocity.x = 300

        } else {
            chosenPlayer.car.animations.stop()
        }
    }

    if (chosenPlayer.textSprite) {

        chosenPlayer.textSprite.x = chosenPlayer.car.body.x
    }
}

function update() {
    Object.keys(explosions).forEach(function (explosion) {
        explosions[explosion].alpha -= 0.1
    })

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

    count = 0;
    for (var playerID in players) {
        if(typeof players[playerID].car.controlData != 'undefined'){
            game.debug.text(players[playerID].car.controlData.name + ': ' + players[playerID].car.score, 32, y);
            count++;
        }

        game.debug.body(players[playerID].car)

        y = y + 32;
    }

    if(count === 0)
    {
        clearDebugText();
    }
}
