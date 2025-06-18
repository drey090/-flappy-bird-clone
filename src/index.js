import Phaser from 'phaser';

class PreloadScene extends Phaser.Scene {
  preload() {
    this.load.image('bg',   'assets/bg.png');
    this.load.image('pipe', 'assets/pipe.png');
    this.load.spritesheet('bird','assets/bird.png',{ frameWidth:34, frameHeight:24 });
  }
  create() { this.scene.start('Game'); }
}

class GameScene extends Phaser.Scene {
  constructor(){ super('Game'); }
  create() {
    this.add.tileSprite(0,0,this.scale.width,this.scale.height,'bg').setOrigin(0);
    this.bird = this.physics.add.sprite(100,300,'bird').setGravityY(800).setOrigin(0.5);
    this.anims.create({ key:'fly',
      frames:this.anims.generateFrameNumbers('bird',{start:0,end:2}),
      frameRate:10, repeat:-1 });
    this.bird.play('fly');
    this.input.on('pointerdown',()=>this.bird.setVelocityY(-300));
    this.input.keyboard.on('keydown-SPACE',()=>this.bird.setVelocityY(-300));
    this.pipes = this.physics.add.group();
    this.time.addEvent({ delay:1500, loop:true, callback:this.spawnPipes, callbackScope:this });
    this.physics.add.overlap(this.bird,this.pipes,()=>this.scene.restart(),null,this);
    this.score = 0;
    this.scoreText = this.add.text(10,10,'Score: 0',{ fontSize:'24px', fill:'#fff' });
  }
  spawnPipes() {
    const gap = Phaser.Math.Between(120,200);
    const topY = Phaser.Math.Between(50,this.scale.height-gap-50);
    ['top','bot'].forEach((pos,i)=>{
      const y = i===0 ? topY : topY+gap;
      this.pipes.create(this.scale.width,y,'pipe')
        .setOrigin(0, i===0?1:0)
        .setImmovable(true).body.allowGravity=false
        .setVelocityX(-200)
        .setData('scored', false);
    });
    // score when pipes move off-screen
    this.pipes.children.iterate(p=>{
      if (!p.getData('scored') && p.x + p.width < this.bird.x) {
        this.score++;
        this.scoreText.setText('Score: ' + this.score);
        p.setData('scored', true);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width:  480,
  height: 640,
  parent: 'game',
  physics:{ default:'arcade' },
  scene: [PreloadScene, GameScene]
};

new Phaser.Game(config);
