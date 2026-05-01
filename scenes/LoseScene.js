/**
 * LoseScene.js – Game over screen.
 */
const W = 1280, H = 720;

export class LoseScene extends Phaser.Scene {
  constructor() { super({ key: 'LoseScene' }); }

  create() {
    this.add.rectangle(W/2, H/2, W, H, 0x050508);

    const g = this.add.graphics();
    g.fillStyle(0x1a0808, 0.94);
    g.fillRoundedRect(W/2-260, H/2-185, 520, 370, 20);
    g.lineStyle(3, 0xcc3333, 1);
    g.strokeRoundedRect(W/2-260, H/2-185, 520, 370, 20);

    this.add.text(W/2, H/2-120, 'GAME OVER', {
      fontSize:'54px', fontFamily:'Arial Black, Arial',
      color:'#ff4444', stroke:'#660000', strokeThickness:6,
    }).setOrigin(0.5);

    this.add.text(W/2, H/2-50, 'All players have fallen!', {
      fontSize:'22px', fontFamily:'Arial', color:'#888899',
    }).setOrigin(0.5);

    this._btn(W/2, H/2+40,  '↺  TRY AGAIN',  () => {
      this.scene.stop('LoseScene');
      this.scene.start('GameScene');
    });
    this._btn(W/2, H/2+115, '⌂  MAIN MENU',  () => {
      this.scene.stop('LoseScene');
      this.scene.start('MenuScene');
    });
  }

  _btn(x, y, label, cb) {
    const w=290, h=52;
    const bg=this.add.graphics();
    const draw=(hov)=>{
      bg.clear();
      bg.fillStyle(hov?0x994444:0x662222,1);
      bg.fillRoundedRect(x-w/2,y-h/2,w,h,11);
      bg.lineStyle(2,hov?0xff8888:0xaa4444,1);
      bg.strokeRoundedRect(x-w/2,y-h/2,w,h,11);
    };
    draw(false);
    this.add.text(x,y,label,{fontSize:'21px',fontFamily:'Arial',color:'#ffffff',fontStyle:'bold'}).setOrigin(0.5).setDepth(5);
    const z=this.add.zone(x,y,w,h).setInteractive({useHandCursor:true}).setDepth(6);
    z.on('pointerover',()=>draw(true)); z.on('pointerout',()=>draw(false)); z.on('pointerdown',cb);
  }
}
