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
      barX, barY + 10, barWidth, 20, 0xff4444
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
    if (this.hp <= 0) this.emit('defeated');
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
    this.scene.time.delayedCall(1000, () => {
      this.onPhaseChange(this.phase);
    });
  }

  // Override in subclasses
  onPhaseChange(phase) {}
  updateBoss(time, delta, players) {}

  update(time, delta, players) {
    this.updateBoss(time, delta, players);
    // _updateHpBar is called inside takeDamage — no need here
  }

  destroy() {
    this._hpBarBg?.destroy();
    this._hpBarFill?.destroy();
    super.destroy();
  }
}
