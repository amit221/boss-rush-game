import { shouldBossBeDefeated } from './bossDefeatLogic.js';

const BOSS_AURA_COLORS = {
  boss_kingslime:   0x44ff22,  // slime green
  boss_pyroskull:   0xff6600,  // fire orange
  boss_stormeagle:  0x6688ff,  // lightning blue
  boss_irongolem:   0x888888,  // steel gray
  boss_shadowmimic: 0x880033,  // shadow crimson
  boss_kraken:      0x0088ff,  // ocean blue
  boss_voidgod:     0xaa00ff,  // void purple
};
const DEFAULT_AURA_COLOR = 0xffaa44; // fallback

export default class BaseBoss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, textureKey, config) {
    super(scene, x, y, textureKey);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene = scene;
    this.maxHp = config.hp;
    this.hp = config.hp;
    this.phase = 1;

    this._createHpBar(scene);

    // Create per-boss colored glow aura
    const auraColor = BOSS_AURA_COLORS[textureKey] ?? DEFAULT_AURA_COLOR;
    this._auraColor = auraColor;
    this._auraGfx = scene.add.graphics();
    this._auraGfx.setDepth(this.depth - 1);

    // Pulsing tween on aura alpha (0.4 → 1.0 → 0.4, 1500ms yoyo loop)
    scene.tweens.add({
      targets: this._auraGfx,
      alpha: { from: 0.4, to: 1.0 },
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });

    this.setCollideWorldBounds(true);
  }

  _createHpBar(scene) {
    const barWidth = 600;
    const barX = (1280 - barWidth) / 2;
    const barY = 10;

    this._hpBarBg = scene.add.rectangle(
      barX + barWidth / 2, barY + 10, barWidth, 20, 0x333333
    ).setScrollFactor(0).setDepth(100);

    // Left-anchored fill bar — set x to left edge, origin to (0, 0.5)
    this._hpBarFill = scene.add.rectangle(
      barX, barY + 10, barWidth, 20, 0xff4400
    ).setScrollFactor(0).setDepth(101);
    this._hpBarFill.setOrigin(0, 0.5);

    this._barWidth = barWidth;
  }

  _updateHpBar() {
    const ratio = Math.max(0, this.hp / this.maxHp);
    this._hpBarFill.scaleX = ratio;
  }

  takeDamage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    this._updateHpBar();
    this._checkPhase();
    this._checkDefeated();
  }

  _checkDefeated() {
    if (shouldBossBeDefeated(this.hp, this._defeatedEmitted)) {
      this._defeatedEmitted = true;
      this.emit('defeated');
    }
  }

  _checkPhase() {
    const ratio = this.hp / this.maxHp;
    const newPhase = ratio <= 0.5 ? 2 : 1;
    if (newPhase !== this.phase) {
      this.phase = newPhase;
      this._doPhaseTransition();
    }
  }

  _doPhaseTransition() {
    this.scene.cameras.main.flash(300, 255, 255, 255);
    const label = this.scene.add.text(640, 360, `PHASE ${this.phase}!`, {
      fontSize: '64px', color: '#ff4444', fontStyle: 'bold',
      stroke: '#000000', strokeThickness: 8
    }).setOrigin(0.5).setScrollFactor(0).setDepth(300);
    this.scene.tweens.add({ targets: label, alpha: 0, delay: 800, duration: 400, onComplete: () => label.destroy() });
    this.scene.time.delayedCall(1000, () => {
      this.onPhaseChange(this.phase);
    });
  }

  // Override in subclasses
  onPhaseChange(phase) {}
  updateBoss(time, delta, players) {}

  update(time, delta, players) {
    // Update aura position and appearance
    if (this._auraGfx && this._auraGfx.active) {
      this._auraGfx.clear();
      this._auraGfx.lineStyle(5, this._auraColor, 0.85);
      this._auraGfx.strokeCircle(this.x, this.y, this.displayWidth * 0.55);
    }

    this._checkDefeated(); // Safety net: catch 0 HP even if takeDamage missed it
    this.updateBoss(time, delta, players);
    // _updateHpBar is called inside takeDamage — no need here
  }

  destroy() {
    this._hpBarBg?.destroy();
    this._hpBarFill?.destroy();
    this._auraGfx?.destroy();
    super.destroy();
  }
}
