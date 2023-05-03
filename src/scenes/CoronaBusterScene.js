import Phaser from "phaser";
import FallingObject from "../ui/FallingObject";

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
  }

  preload(){
    this.load.image('background', 'images/bg_layer1.png')
    this.load.image('cloud', 'images/cloud.png')
    this.load.image('left-btn', 'images/left-btn.png')
    this.load.image('right-btn', 'images/right-btn.png')
    this.load.image('shoot-btn', 'images/shoot-btn.png')
    this.load.image('enemy', 'images/enemy.png')

    // load player spritesheet
    this.load.spritesheet('player', 'images/ship.png', {
      frameWidth: 66,
      frameHeight: 66
    });
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
      runChildUpdate: true
    })

    this.time.addEvent({
      delay: Phaser.Math.Between(1000, 5000),
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true
    })
  }

  update(time){
    this.clouds.children.iterate((child) => {
      // set cloud speed
      child.setVelocityY(20);

      if (child.y > this.scale.height) {
        child.x = Phaser.Math.Between(10, 400);
        child.y = 0;
      }
    })

    this.movePlayer(this.player, time);
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
}