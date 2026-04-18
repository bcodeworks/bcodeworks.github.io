var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var dm;
var box;
var gameOver = false;
var processing = 0;
var moving = 0; //0 not moving, 1 moving
var playerSelf;
var targetX;
var targetY;
const spawnX = 250;
const spawnY = 400;
var speed = 200;
//var platforms;
var todo = 0;
var cursors;
var freemov=false;
var friendcounter=0;
const pnouns = ["HE/HIM", "SHE/HER", "WHEE/WHIRR", "KNEE/HURT", "SCHMEE/SCHLIM", "FLEA (from the red hot chili peppers)", "AAAAAAAAAAAAAAAA", "CE/DAR", "FE/MUR"];
var dialogue_index = 0;
var dialogue_words = ["You greet the stranger.", "They say hi.", "You ask what their pronouns are.", "They say.", "They say..", "They say...", "ERROR", "The new friend joined your party."];
var debugbox;
var friendlist = [];

function timerCode() {
    dm.innerHTML=dialogue_words[dialogue_index];
    dialogue_index++;
    if(dialogue_index>7){}
    else if (dialogue_index==4||dialogue_index==5) {
        setTimeout(timerCode, 700);
    }
    else if(dialogue_index==7){
        setTimeout(timerCode, 4000);
    }
    else {
        setTimeout(timerCode, 2000);
    }
}

function preload (){
    this.load.image('room', 'assets/room0.png');
    this.load.image('flag', 'assets/asset1.png');
    this.load.spritesheet('you', 'assets/spritesheet_1.png', { frameWidth: 60, frameHeight: 100 });
    this.load.spritesheet('stuff', 'assets/spritesheet_1.png', { frameWidth: 120, frameHeight: 100 });
    this.load.spritesheet('head', 'assets/spritesheet_1.png', { frameWidth: 60, frameHeight: 40 });
    //this.load.image('sky', 'assets/sky.png');
    //this.load.image('ground', 'assets/platform.png');
    this.load.image('star', 'assets/star.png');
    //this.load.image('bomb', 'assets/bomb.png');
    //this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create (){
    this.add.image(400, 300, 'room');

    targetX = spawnX;
    targetY = spawnY;

    playerSelf = this.physics.add.sprite(spawnX, spawnY, 'you');
    playerHolder = playerSelf;
    //playerSelf.setCollideWorldBounds(true);

    // for attaching objects to player
    /*playerHolder =  this.add.container(spawnX, spawnY);
    playerSelf = this.physics.add.sprite(0, 0, 'you');
    playerHolder.add([playerSelf]);
    this.physics.world.enableBody(playerHolder);*/

    // player animations
    this.anims.create({
        key: 'stand',
        frames: [ { key: 'you', frame: 0 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNumbers('you', { start: 2, end: 3 }),
        frameRate: 5,
        repeat: -1
    });
    this.anims.create({
        key: 'hands',
        frames: [ { key: 'you', frame: 6 } ],
        frameRate: 20
    });
    this.anims.create({
        key: 'all',
        frames: 'you',
        frameRate: 1
    });

    //create narrator box
    const container1 = document.getElementById('narration-area');
    dm = document.createElement('p');
    dm.style.position = "absolute";
    dm.style.bottom = "40px";
    dm.style.left = "20px";
    dm.style.color = "magenta";
    dm.style.fontSize = "20px";
    dm_words = document.createTextNode("You're alone in a queer room.");
    dm.appendChild(dm_words);
    container1.appendChild(dm);
    //create suggestion box
    const container2 = document.getElementById('suggestion-area');
    box = document.createElement('input');
    box.setAttribute('type', 'text'); //unnecessary, default
    box.style.position = "absolute";
    box.style.bottom = "20px";
    box.style.left = "20px";
    box.style.color = "black";
    box.style.fontSize = "20px";
    //box.style.zIndex = 1000;
    container2.appendChild(box);

    //debug-boxes
    const container3 = document.getElementById('debug-area');
    debugbox = document.createElement('p');
    debugbox.setAttribute('type', 'text'); //unnecessary, default
    debugbox.style.position = "absolute";
    debugbox.style.top = "20px";
    debugbox.style.left = "20px";
    debugbox.style.color = "black";
    debugbox.style.fontSize = "40px";
    container3.appendChild(debugbox);

    //UI-BG
    var bgs = this.add.graphics();
    bgs.fillStyle(0x331111,0.8);
    bgs.fillRect(0, 470, 400, 100);

    enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    //create friendy
    friend = this.physics.add.sprite(400, 350, 'you');
    friend.anims.play('stand');
    friend.setFlipX(true);

    friend.setDepth(5);
    playerSelf.setDepth(10);

    //friendmask
    var maskGraphics = this.add.graphics();
    maskGraphics.fillStyle(0xffffff, 0);
    maskGraphics.fillRect(320, 0, 1000, 1000);
    var mask = new Phaser.Display.Masks.GeometryMask(this, maskGraphics);
    friend.mask = mask;

    //object group
    //objects = this.physics.add.staticGroup();
    //objects.create(400,200,'stuff');

    cursors = this.input.keyboard.createCursorKeys();

    //raise-flag
    flag = this.physics.add.sprite(350, 150, 'flag');
    flag.setScale(0.4);
}

function update (){
    //debugbox.innerHTML = "processing: " + processing + "\ndialogue: " + dialogue_index;

    if (gameOver&&friend.y>700)
    {
        playerSelf.anims.play('hands');
        return;
    }

    if(freemov){
        //for testing movement
        if (cursors.left.isDown){
            playerSelf.setVelocityX(-160);
            playerSelf.anims.play('walk', true);
        }
        else if (cursors.right.isDown){
            playerSelf.setVelocityX(160);
            playerSelf.anims.play('walk', true);
        }
        else{
            playerSelf.setVelocityX(0);
        }
        if (cursors.up.isDown){
            playerSelf.setVelocityY(-160);
            playerSelf.anims.play('walk', true);
        }
        else if (cursors.down.isDown){
            playerSelf.setVelocityY(160);
            playerSelf.anims.play('walk', true);
        }
        else{
            playerSelf.setVelocityY(0);
        }
    }

    if (Phaser.Input.Keyboard.JustDown(enterKey))
    {
        processing = 1;
        box.setAttribute("readonly", true);
        box.style.color = "blue";
        var suggestion = box.value;
        //parse suggestion, output word of dog
        var wordofdog = "I'm sorry, I don't think I can " + suggestion + ".";
        if(suggestion == "die"){
            processing=3;
            todo=66;
            wordofdog = "You have passed.";
        }
        else if(suggestion == "walk"){
            //playerSelf.setVelocityX(160);
            dm.innerHTML = "10%";//debug
            targetX = 600;
            targetY = 450;
            moving = 1;
            wordofdog = "You walk over here.";
            //QUESTION - Why does player go slowly the first time walk is used?
        }
        else if(suggestion == "walk over there"){
            targetX = 500;
            targetY = 300;
            moving = 1;
            wordofdog = "You walk over there.";
        }
        else if(suggestion == "greet"){
            targetX = 320;
            targetY = 345;
            moving = 1;
            todo = 1;
            //while(true){}
            wordofdog = "You...";
        }
        else if(suggestion == "return"){
            //playerSelf.setVelocityX(0);
            //playerSelf.setPosition(100,350);
            //this.physics.moveTo(playerHolder,spawnX,spawnY,speed);
            targetX = spawnX;
            targetY = spawnY;
            moving = 1;
            //change to walking animation
            //playerSelf.anims.play('walk');
            wordofdog = "You return.";
        }
        else if(suggestion == "debug"){
            playerSelf.anims.play('all');
            wordofdog = "sv_cheats 1";
            processing = 100; //one-and-done built-in action
        }
        else if(suggestion == "check friends"){
            if(friendlist.length<1){
                wordofdog = "No friends yet!";
            }
            else{
                wordofdog = "Friends: " + friendlist;
            }
            processing = 100;
        }
        else{
            processing = 100; //command not found
        }
        dm.innerHTML = wordofdog; //instant message
    }

    //restore box
    if (processing == 100) //reset and re-enable box
    {
        //dm.innerHTML="RESET!";
        processing = 0;
        box.value = "";
        box.style.color = "black";
        box.removeAttribute("readonly");
    }

    //walking
    if (moving == 1){
        this.physics.moveTo(playerHolder,targetX,targetY,speed);
        //change to walking animation
        playerSelf.anims.play('walk');
        moving = 2;
        playerSelf.setFlipX(playerHolder.body.velocity.x<0)
    }
    //stop
    if (!freemov && Math.abs(targetX - playerSelf.x) < 5){
        if(todo==1){
            playerSelf.setFlipX(false);
        }
        playerHolder.setVelocityX(0);
    }
    if (!freemov && Math.abs(targetY - playerSelf.y) < 5){
        playerHolder.setVelocityY(0);
    }
    //confirm stop
    if(processing == 1 && moving == 2 && playerHolder.body.velocity.x == 0 && playerHolder.body.velocity.y == 0){
        playerSelf.anims.play('stand');
        moving = 0;
        processing = 3;
    }

    //actions
    if(processing==3){
        switch(todo){
            case 0:
                processing=100;
                break;
            case 1:
                if(friend.y<0){
                    dm.innerHTML="All friends here are already greeted.";
                    todo=0;
                    processing=100;
                    friendcounter++;
                }
                else{
                    playerSelf.y=345;
                    playerSelf.anims.play("stand");
                    todo=2;
                }
                break;
            case 2:
                dialogue_index=0;
                dm.innerHTML=dialogue_words[dialogue_index];
                dialogue_index++;
                setTimeout(timerCode, 2000);
                todo=3;
                break;
            case 3:
                //while dialogue runs
                if(dialogue_index==4){
                    dialogue_words[6]=pnouns[Math.floor(Math.random()*pnouns.length)];
                }
                if(dialogue_index==7){
                    friend.anims.play("hands");
                }
                if(dialogue_index==8){
                    friend.setVelocityX(-200);
                    friendlist.push(dialogue_words[6]);
                    todo=0;
                    processing=4;
                }
                break;
            case 66:
                playerSelf.angle=-90;
                playerSelf.x-=50;
                playerSelf.y+=30;
                gameOver = true;
                processing=100;
                break;
            default:
        }
    }

    //passives
    if (playerHolder.y<350){
        playerHolder.setDepth(2);
    }
    if (playerHolder.y>350){
        playerHolder.setDepth(10);
    }
    if (friend.x<200){
        friend.x=400;
        friend.y=-100;
        friend.body.velocity.x=0;
        processing=100;
    }
    //if(processing==3&&friend.y==-100){
    if(friendcounter==2&&friend.y==-100){
        friendcounter=0;
        friend.body.velocity.y=1000;
    }
    if (friend.y>=350&&friend.body.velocity.y==1000){
        friend.anims.play("stand");
        friend.body.velocity.y=0;
        friend.y=350;
        dm.innerHTML="oh hey";
    }
}

/*
//unused create code
    const form = document.createElement('form');
    form.setAttribute('action', '/submit-page'); // Set the form submission URL
    form.setAttribute('method', 'POST'); // Set the HTTP method
    const usernameLabel = document.createElement('label');
    usernameLabel.textContent = '>';
    const submitButton = document.createElement('button');
    submitButton.setAttribute('type', 'submit');
    submitButton.textContent = 'Submit';
    form.appendChild(usernameLabel);
    form.appendChild(usernameInput);
    form.appendChild(document.createElement('br')); // Add a line break for spacing
    form.appendChild(submitButton);

    platforms = this.physics.add.staticGroup();
    platforms.create(400, 568, 'ground').setScale(2).refreshBody();
*/

/*
//unused update code
    if (this.player.targetX !== undefined) {
        const distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.player.targetX, this.player.targetY);
        if (distance < 10)  // Check if the object is close enough to the target
            this.player.body.reset(this.player.targetX, this.player.targetY);
            this.player.targetX = undefined;
        }
    }
    setTimeout(() => {
        processing = 2;
    }, 2000);
*/