import Phaser from "phaser";
import FallingObject from "../ui/FallingObject";
import Laser from "../ui/Laser";

export default class CoronaBusterScene extends Phaser.Scene {
  constructor(){
    super('corona-buster-scene');
  }

  init(){
    this.clouds = undefined;
    this.nav_left = undefined;
    this.nav_right = undefined;
    this.shoot = undefined;
    this.player = undefined
    this.speed = 100;
    this.enemies = undefined;
    this.enemySpeed = 50;
    this.lasers = undefined;
    this.lastFired = 10;
    this.scoreLabel = undefined;
    this.score = 0;
    this.lifeLabel = undefined;
    this.life = 3;
    this.handsanitizer = undefined;
    this.backsound = undefined;
  }

  preload(){
    this.load.image('background', 'images/bg_layer1.png')
    this.load.image('cloud', 'images/cloud.png')
    this.load.image('left-btn', 'images/left-btn.png')
    this.load.image('right-btn', 'images/right-btn.png')
    this.load.image('shoot-btn', 'images/shoot-btn.png')
    this.load.image('enemy', 'images/enemy.png')
    this.load.image('handsanitizer', 'images/handsanitizer.png')

    // load player spritesheet
    this.load.spritesheet('player', 'images/ship.png', {
      frameWidth: 66,
      frameHeight: 66
    });

    this.load.spritesheet('laser', 'images/laser-bolts.png', {
      frameWidth: 16,
      frameHeight: 16
    });

    // load sound effects
    this.load.audio('bgsound', 'sfx/AloneAgainst Enemy.ogg');
    this.load.audio('laser', 'sfx/sfx_laser.ogg');
    this.load.audio('destroy', 'sfx/destroy.mp3')
    this.load.audio('life', 'sfx/handsanitizer.mp3')
    this.load.audio('gameover', 'sfx/gameover.wav')
  }

  create(){
    const gameWidth = this.scale.width * 0.5;
    const gameHeight = this.scale.height * 0.5;
    this.add.image(gameWidth, gameHeight, 'background'); // add image to the center of the screen

    this.clouds = this.physics.add.group({
      key: 'cloud',
      repeat: 20,
    });

    Phaser.Actions.RandomRectangle(this.clouds.getChildren(), this.physics.world.bounds); // place clouds randomly

    this.createButtons();

    this.player = this.createPlayer();

    this.enemies = this.physics.add.group({
      classType: FallingObject,
      maxSize: 10,
      runChildUpdate: true // update all children of this group
    })

    this.time.addEvent({
      delay: Phaser.Math.Between(1000, 5000),
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    })

    this.lasers = this.physics.add.group({
      classType: Laser,
      maxSize: 10,
      runChildUpdate: true
    })

    // overlap between lasers and enemies
    this.physics.add.overlap(this.lasers, this.enemies, this.hitEnemy, null, this);

    this.scoreLabel = this.add.text(10, 10, 'Score', {
      fontSize : '16px',
      color: 'black',
      backgroundColor: 'white'
    }).setDepth(1);

    this.lifeLabel = this.add.text(10, 30, 'Life', {
      fontSize : '16px',
      color: 'black',
      backgroundColor: 'white'
    }).setDepth(1);
    
    // overlap between player and enemies
    this.physics.add.overlap(this.player, this.enemies, this.decreaseLife, null, this);

    this.handsanitizer = this.physics.add.group({
      classType: FallingObject,
      runChildUpdate: true
    })

    this.time.addEvent({
      delay: 10000,
      callback: this.spawnHandsanitizer,
      callbackScope: this,
      loop: true
    })

    // overlap between player and handsanitizer
    this.physics.add.overlap(this.player, this.handsanitizer, this.increaseLife, null, this);

    this.backsound = this.sound.add('bgsound');

    var soundConfig = {
      loop: true,
      volume: 0.25
    }

    this.backsound.play(soundConfig);
  }

  update(time){
    this.clouds.children.iterate((child) => {
      // set cloud speed
      // @ts-ignore
      child.setVelocityY(20);

      if (child.y > this.scale.height) {
        child.x = Phaser.Math.Between(10, 400);
        child.y = 0;
      }
    })

    this.movePlayer(this.player, time);

    this.scoreLabel.setText(`Score: ` + this.score);
    this.lifeLabel.setText(`Life: ` + this.life);
  }

  createButtons(){
    this.input.addPointer(3);

    let shoot = this.add.image(320, 550, 'shoot-btn').setInteractive().setDepth(0.5).setAlpha(0.8);
    let nav_left = this.add.image(50, 550, 'left-btn').setInteractive().setDepth(0.5).setAlpha(0.8);
    let nav_right = this.add.image(nav_left.x + nav_left.displayWidth + 20, 550, 'right-btn').setInteractive().setDepth(0.5).setAlpha(0.8);

    nav_left.on('pointerdown', () => {
      this.nav_left = true;
      console.log('left')
    })

    nav_left.on('pointerout', () => {
      this.nav_left = false;
    })

    nav_right.on('pointerdown', () => {
      this.nav_right = true;
    })

    nav_right.on('pointerout', () => {
      this.nav_right = false;
    })

    shoot.on('pointerdown', () => {
      this.shoot = true;
    })

    shoot.on('pointerout', () => {
      this.shoot = false;
    })
  } 

  createPlayer(){
    const player = this.physics.add.sprite(200, 450, 'player');
    player.setCollideWorldBounds(true);

    this.anims.create({ // create animation
      key: 'turn', 
      frames: [
        { key: 'player', frame: 0 } 
      ],
    })

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('player', { start: 1, end: 2 }),
    })

    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('player', { start: 1, end: 2 }),
    })

    return player;
  }

  movePlayer(player, time){
    if (this.nav_left){
      this.player.setVelocityX(this.speed * -1);
      this.player.anims.play('left', true);
      this.player.setFlipX(false); 
    } else if (this.nav_right){
      this.player.setVelocityX(this.speed);
      this.player.anims.play('right', true);
      this.player.setFlipX(true);
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play('turn');
    }

    if ((this.shoot) && time > this.lastFired){ // shoot laser every 150ms
      const laser = this.lasers.get(0, 0, 'laser'); // get laser from pool
      if (laser) {
        laser.fire(this.player.x, this.player.y);
        this.lastFired = time + 150;
        this.sound.play('laser');
      }
    }
  }

  spawnEnemy(){
    const config = {
      speed: 30,
      rotation: 0.1
    }
    // @ts-ignore
    const enemy = this.enemies.get(0, 0, 'enemy', config);
    const positionX = Phaser.Math.Between(50, 350);

    if (enemy) {
      enemy.spawn(positionX);
    }
  }

  hitEnemy(laser, enemy){
    laser.die();
    enemy.die();
    this.score += 10;
    this.sound.play('destroy');
  }

  decreaseLife(player, enemy){
    enemy.die();
    this.life -= 1;

    if ( this.life == 2 ){
      player.setTint(0xff0000);
    } else if ( this.life == 1){
      player.setTint(0xff0000).setAlpha(0.2);
    } else if ( this.life == 0){
      this.sound.stopAll();
      this.sound.play('gameover');
      this.scene.start('over-scene', {score: this.score});
    }
  }

  spawnHandsanitizer(){
    const config = {
      speed: 60,
      rotation: 0
    }
    // @ts-ignore
    const handsanitizer = this.handsanitizer.get(0, 0, 'handsanitizer', config);
    const positionX = Phaser.Math.Between(70, 330);

    if (handsanitizer) {
      handsanitizer.spawn(positionX);
    }
  }

  increaseLife(player, enemy){
    enemy.die();
    this.life += 1;
    this.sound.play('life');

    if( this.life >= 3){
      player.clearTint().setAlpha(1);
    } else if( this.life >= 2){
      player.setTint(0xff0000).setAlpha(0.2);
    }
  }
}