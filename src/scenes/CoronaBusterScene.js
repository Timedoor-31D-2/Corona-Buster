import Phaser from "phaser";

export default class CoronaBusterScene extends Phaser.Scene {
  constructor(){
    super('corona-buster-scene');
  }

  init(){
    this.clouds = undefined;
    this.nav_left = undefined;
    this.nav_right = undefined;
    this.shoot = undefined;
  }

  preload(){
    this.load.image('background', 'images/bg_layer1.png')
    this.load.image('cloud', 'images/cloud.png')
    this.load.image('left-btn', 'images/left-btn.png')
    this.load.image('right-btn', 'images/right-btn.png')
    this.load.image('shoot-btn', 'images/shoot-btn.png')
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
  }

  createButtons(){
    this.input.addPointer(3);

    let shoot = this.add.image(320, 550, 'shoot-btn').setInteractive().setDepth(0.5).setAlpha(0.8);
    let nav_left = this.add.image(50, 550, 'left-btn').setInteractive().setDepth(0.5).setAlpha(0.8);
    let nav_right = this.add.image(nav_left.x + nav_left.displayWidth + 20, 550, 'right-btn').setInteractive().setDepth(0.5).setAlpha(0.8);

    nav_left.on('pointerdown', () => {
      this.nav_left = true;
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
}