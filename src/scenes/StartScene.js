import Phaser from 'phaser'

export default class StartScene extends Phaser.Scene{
  
  constructor(){
    super('start-scene')
  }

  init(data){
    this.startButton = undefined;
  }

  preload(){
    this.load.image('background', 'images/bg_layer1.png')
  }

  create(){
    this.add.image(200, 320, 'background')
    this.startButton = this.add.text(100, 300, 'Start Game', { fontSize: '32px', color: '#000' }).setInteractive()

    this.startButton.once('pointerup', () => {
      this.scene.start('corona-buster-scene')
    }, this)
  }
}