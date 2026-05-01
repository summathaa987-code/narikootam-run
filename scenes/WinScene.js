/**
 * WinScene.js – Level complete screen with animated stars.
 */
const W = 1280, H = 720;
const LEVEL_NAMES = ['The Meadow','The Cliffs','The Tower','The Abyss','The Gauntlet'];

export class WinScene extends Phaser.Scene {
  constructor() { super({ key: 'WinScene' }); }

  create() {
    const lvl     = this.registry.get('currentLevel') ?? 1;
    const hasNext = lvl < 5;

    // Background
    this.add.rectangle(W/2, H/2, W, H, 0x050510);
    this._starGfx = this.add.graphics().setDepth(0);
    this._stars   = Array.from({length:90}, () => ({
      x: Phaser.Math.Between(0,W), y: Phaser.Math.Between(0,H),
      r: Phaser.Math.Between(1,3),
      speed: Phaser.Math.FloatBetween(0.5,2),
      phase: Phaser.Math.FloatBetween(0, Math.PI*2),
    }));

    // Panel
    const g = this.add.graphics().setDepth(5);
    g.fillStyle(0x081808, 0.94);
    g.fillRoundedRect(W/2-280, H/2-215, 560, 430, 20);
    g.lineStyle(3, 0x44cc44, 1);
    g.strokeRoundedRect(W/2-280, H/2-215, 560, 430, 20);

    // Animated star icons
    ['⭐','⭐','⭐'].forEach((s, i) => {
      const t = this.add.text(W/2-80+i*80, H/2-170, s, { fontSize:'38px' })
        .setOrigin(0.5).setDepth(10).setAlpha(0).setScale(0);
      this.time.delayedCall(300+i*200, () => {
        this.tweens.add({
          targets: t, alpha:1, scaleX:1, scaleY:1,
          duration:400, ease:'Back.easeOut',
        });
      });
    });

    this.add.text(W/2, H/2-100, 'LEVEL COMPLETE!', {
      fontSize:'46px', fontFamily:'Arial Black, Arial',
      color:'#44ff88', stroke:'#006622', strokeThickness:5,
    }).setOrigin(0.5).setDepth(10);

    this.add.text(W/2, H/2-42, LEVEL_NAMES[lvl-1] ?? '', {
      fontSize:'24px', fontFamily:'Arial', color:'#aaaacc',
    }).setOrigin(0.5).setDepth(10);

    let btnY = H/2+30;
    if (hasNext) {
      this._btn(W/2, btnY, '▶  NEXT LEVEL', () => {
        this.registry.set('currentLevel', lvl+1);
        this.scene.stop('WinScene');
        this.scene.start('GameScene');
      });
      btnY += 72;
    }
    this._btn(W/2, btnY,    '↺  REPLAY',    () => {
      this.scene.stop('WinScene');
      this.scene.start('GameScene');
    });
    this._btn(W/2, btnY+72, '⌂  MAIN MENU', () => {
      this.scene.stop('WinScene');
      this.scene.start('MenuScene');
    });
  }

  update(time) {
    const g = this._starGfx; g.clear();
    for (const s of this._stars) {
      const a = 0.3+0.7*Math.abs(Math.sin(time*0.001*s.speed+s.phase));
      g.fillStyle(0xffffff,a); g.fillCircle(s.x,s.y,s.r);
    }
  }

  _btn(x, y, label, cb) {
    const w=290, h=52;
    const bg=this.add.graphics().setDepth(10);
    const draw=(hov)=>{
      bg.clear();
      bg.fillStyle(hov?0x4477cc:0x2a4a8a,1);
      bg.fillRoundedRect(x-w/2,y-h/2,w,h,11);
      bg.lineStyle(2,hov?0x88bbff:0x4466aa,1);
      bg.strokeRoundedRect(x-w/2,y-h/2,w,h,11);
    };
    draw(false);
    this.add.text(x,y,label,{fontSize:'21px',fontFamily:'Arial',color:'#ffffff',fontStyle:'bold'}).setOrigin(0.5).setDepth(11);
    const z=this.add.zone(x,y,w,h).setInteractive({useHandCursor:true}).setDepth(12);
    z.on('pointerover',()=>draw(true)); z.on('pointerout',()=>draw(false)); z.on('pointerdown',cb);
  }
}
