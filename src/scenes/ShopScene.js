import { WEAPONS, getShopWeaponIds } from '../data/weapons.js';
import { CHARACTERS } from '../data/characters.js';
import { FONT_FAMILY, addMenuBackdrop, COLORS } from '../ui/theme.js';
import { T } from '../i18n/hebrew.js';
import { abandonRunToMenu } from '../navigation.js';
import { playUiBuy, playUiConfirm, playUiBack } from '../audio/sfx.js';
import { ensureBgm } from '../audio/music.js';
import { createAudioControls } from '../ui/audioControls.js';
import { getShardCoinPrice, MYSTERY_BOX_COIN_PRICE } from '../data/weaponEconomy.js';

const ROW_H = 50;
const SCROLL_H = 400;
const COL_W = 520;
const ICON_X = 16;

function weaponStatLine(w) {
  return T.weaponStatLine(
    w.damageMultiplier.toFixed(2),
    w.fireRateMultiplier.toFixed(2),
    Math.round(w.range),
  );
}

function sortedShopWeaponIds() {
  return getShopWeaponIds().slice().sort((a, b) =>
    WEAPONS[a].name.localeCompare(WEAPONS[b].name, 'he'),
  );
}

export default class ShopScene extends Phaser.Scene {
  constructor() { super('ShopScene'); }

  create() {
    this._sm = this.registry.get('shopManager');
    this._playerCount = this.registry.get('playerCount') ?? 1;
    this._confirmed = { 1: false, 2: this._playerCount === 1 };
    this._weaponScroll = { 1: 0, 2: 0 };
    this._scrollMax = { 1: 0, 2: 0 };
    this._scrollContainers = {};
    this._maskTops = {};
    this._buildUI();
    this._setupInput();
    this._setupScrollWheel();
    ensureBgm(this, 'music_menu');
    createAudioControls(this);
  }

  _setupScrollWheel() {
    this.input.on('wheel', (pointer, _go, _dx, deltaY) => {
      const pid = this._playerCount === 2 && pointer.x >= 640 ? 2 : 1;
      const max = this._scrollMax[pid] ?? 0;
      if (max <= 0) return;
      const next = Phaser.Math.Clamp(
        (this._weaponScroll[pid] ?? 0) + deltaY * 0.35,
        0,
        max,
      );
      this._weaponScroll[pid] = next;
      const cont = this._scrollContainers[pid];
      const top = this._maskTops[pid];
      if (cont && top != null) cont.y = top - next;
    });
  }

  _buildUI() {
    const sm = this._sm;
    const chars = this.registry.get('selectedCharacters') ?? { 1: 'brute', 2: 'scout' };
    addMenuBackdrop(this);
    this.add.rectangle(640, 360, 1240, 680, 0x000000, 0.22).setDepth(-9);
    this.add.text(640, 30, T.shopTitle, {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
      color: '#ffdd88',
      stroke: '#4a3510', strokeThickness: 5,
    }).setOrigin(0.5);

    const pids = this._playerCount === 1 ? [1] : [1, 2];
    pids.forEach((pid) => {
      const charId = chars[pid];
      if (!charId) return;
      const ox = this._playerCount === 1 ? 640 : (pid === 1 ? 320 : 960);
      const color = pid === 1 ? '#4488ff' : '#ff8844';
      const left = ox - COL_W / 2;

      const charName = CHARACTERS[charId]?.name ?? charId;
      this.add.text(ox, 72, T.shopPlayer(pid, charName), {
        fontFamily: FONT_FAMILY, fontSize: '14px', color,
      }).setOrigin(0.5);
      this.add.text(ox, 94, T.coins(sm.getCoins(charId)), {
        fontFamily: FONT_FAMILY, fontSize: '12px', color: '#ffdd00',
      }).setOrigin(0.5);

      this.add.line(ox, 112, 0, 0, 240, 0, COLORS.strokeDim);

      this._addDefaultWeaponRow(ox, left, charId, 118);
      const mysteryY = 168;
      this._addMysteryRow(ox, left, charId, mysteryY);

      const maskTop = mysteryY + 36;
      this._maskTops[pid] = maskTop;
      const maskG = this.add.graphics().setScrollFactor(0).setVisible(false);
      maskG.fillStyle(0xffffff, 1);
      maskG.fillRect(left, maskTop, COL_W, SCROLL_H);
      const geomMask = maskG.createGeometryMask();

      const cont = this.add.container(left, maskTop).setDepth(5);
      cont.setMask(geomMask);
      this._scrollContainers[pid] = cont;

      let y = 8;
      sortedShopWeaponIds().forEach((wid) => {
        y += this._addWeaponBlock(cont, ox - left, y, charId, wid);
      });

      const innerH = y + 8;
      this._scrollMax[pid] = Math.max(0, innerH - SCROLL_H);
      cont.y = maskTop - (this._weaponScroll[pid] ?? 0);
    });

    if (this._playerCount === 2) {
      this.add.line(640, 360, 0, -360, 0, 360, 0x3a4860).setLineWidth(2);
    }

    pids.forEach((pid) => {
      const ox = this._playerCount === 1 ? 640 : (pid === 1 ? 320 : 960);
      const doneColor = this._confirmed?.[pid] ? '#44ff44' : '#ffffff';
      const doneKey = pid === 1 ? 'ENTER' : 'SHIFT';
      this.add.text(ox, 668, T.shopDone(doneKey), {
        fontFamily: FONT_FAMILY, fontSize: '12px', color: doneColor,
      }).setOrigin(0.5);
    });

    this.add.text(640, 698, T.shopEscHint, {
      fontFamily: FONT_FAMILY,
      fontSize: '8px', color: '#666666',
    }).setOrigin(0.5);
  }

  _addDefaultWeaponRow(ox, left, charId, yTop) {
    const sm = this._sm;
    const w = WEAPONS.default;
    const equipped = sm.getEquippedWeapon(charId) === 'default';
    const nameCol = equipped ? '#44ff44' : '#ffffff';
    this.add.image(left + ICON_X, yTop + 10, 'icon_weapon_default').setOrigin(0, 0);
    this.add.text(left + 48, yTop + 4, w.name, {
      fontFamily: FONT_FAMILY, fontSize: '13px', color: nameCol,
    }).setOrigin(0, 0);
    this.add.text(left + 48, yTop + 22, weaponStatLine(w), {
      fontFamily: FONT_FAMILY, fontSize: '8px', color: '#888888',
    }).setOrigin(0, 0);
    const eq = this.add.text(left + COL_W - 72, yTop + 14, T.shopEquip, {
      fontFamily: FONT_FAMILY, fontSize: '10px', color: equipped ? '#555555' : '#ffdd88',
    }).setOrigin(0, 0);
    if (!equipped) {
      eq.setInteractive({ useHandCursor: true });
      eq.on('pointerdown', () => {
        if (sm.setEquippedWeapon(charId, 'default')) {
          playUiConfirm(this);
          this.scene.restart();
        }
      });
      eq.on('pointerover', () => eq.setColor('#ffff88'));
      eq.on('pointerout', () => eq.setColor('#ffdd88'));
    }
  }

  _addMysteryRow(ox, left, charId, yTop) {
    const sm = this._sm;
    const can = sm.getCoins(charId) >= MYSTERY_BOX_COIN_PRICE;
    const col = can ? '#ddaaff' : '#555555';
    const t = this.add.text(left + 48, yTop + 8, T.shopMystery(MYSTERY_BOX_COIN_PRICE), {
      fontFamily: FONT_FAMILY, fontSize: '12px', color: col,
    }).setOrigin(0, 0);
    if (can) {
      t.setInteractive({ useHandCursor: true });
      t.on('pointerdown', () => {
        const roll = sm.buyMysteryBox(charId);
        if (roll) {
          playUiBuy(this);
          this.scene.restart();
        }
      });
      t.on('pointerover', () => t.setColor('#ffccff'));
      t.on('pointerout', () => t.setColor('#ddaaff'));
    }
  }

  /** @returns {number} height used */
  _addWeaponBlock(cont, _colW, y0, charId, weaponId) {
    const sm = this._sm;
    const w = WEAPONS[weaponId];
    const tier = sm.getWeaponTier(charId, weaponId);
    const shards = sm.getShardCount(charId, weaponId);
    const need = sm.shardsNeededForNext(charId, weaponId);
    const equipped = sm.getEquippedWeapon(charId) === weaponId;
    const price = getShardCoinPrice(weaponId);
    const canBuyShard = sm.getCoins(charId) >= price;
    const canAdvance = tier >= 0 ? shards >= need : shards >= need;

    const iconKey = `icon_weapon_${weaponId}`;
    const img = this.add.image(ICON_X, y0 + 6, iconKey).setOrigin(0, 0);
    cont.add(img);

    const nameCol = equipped ? '#44ff44' : '#ffffff';
    const tName = this.add.text(48, y0 + 2, w.name, {
      fontFamily: FONT_FAMILY, fontSize: '12px', color: nameCol,
    }).setOrigin(0, 0);
    cont.add(tName);

    const tStat = this.add.text(48, y0 + 18, weaponStatLine(w), {
      fontFamily: FONT_FAMILY, fontSize: '7px', color: '#777777',
    }).setOrigin(0, 0);
    cont.add(tStat);

    const tierLabel = tier < 0 ? T.shopLocked : T.shopTier(tier);
    const tMeta = this.add.text(48, y0 + 28, `${T.shopShards(shards)}  ·  ${tierLabel}`, {
      fontFamily: FONT_FAMILY, fontSize: '8px', color: '#999999',
    }).setOrigin(0, 0);
    cont.add(tMeta);

    let bx = 48;
    const by = y0 + 38;
    const buyShardTxt = this.add.text(bx, by, T.shopBuyShard(price), {
      fontFamily: FONT_FAMILY, fontSize: '9px', color: canBuyShard ? '#ffdd88' : '#555555',
    }).setOrigin(0, 0);
    cont.add(buyShardTxt);
    if (canBuyShard) {
      buyShardTxt.setInteractive({ useHandCursor: true });
      buyShardTxt.on('pointerdown', () => {
        if (sm.buyWeaponShard(charId, weaponId)) {
          playUiBuy(this);
          this.scene.restart();
        }
      });
      buyShardTxt.on('pointerover', () => buyShardTxt.setColor('#ffffaa'));
      buyShardTxt.on('pointerout', () => buyShardTxt.setColor('#ffdd88'));
    }
    bx += 100;

    const advLabel = tier < 0 ? T.shopUnlockCost(need) : T.shopUpgradeCost(need);
    const canAdvColor = canAdvance ? '#88ffaa' : '#555555';
    const advTxt = this.add.text(bx, by, advLabel, {
      fontFamily: FONT_FAMILY, fontSize: '9px', color: canAdvColor,
    }).setOrigin(0, 0);
    cont.add(advTxt);
    if (canAdvance) {
      advTxt.setInteractive({ useHandCursor: true });
      advTxt.on('pointerdown', () => {
        if (sm.advanceWeaponWithShards(charId, weaponId)) {
          playUiBuy(this);
          this.scene.restart();
        }
      });
      advTxt.on('pointerover', () => advTxt.setColor('#ccffcc'));
      advTxt.on('pointerout', () => advTxt.setColor('#88ffaa'));
    }
    bx += 118;

    if (tier >= 0) {
      const eqCol = equipped ? '#555555' : '#aaccff';
      const eqTxt = this.add.text(bx, by, T.shopEquip, {
        fontFamily: FONT_FAMILY, fontSize: '9px', color: eqCol,
      }).setOrigin(0, 0);
      cont.add(eqTxt);
      if (!equipped) {
        eqTxt.setInteractive({ useHandCursor: true });
        eqTxt.on('pointerdown', () => {
          if (sm.setEquippedWeapon(charId, weaponId)) {
            playUiConfirm(this);
            this.scene.restart();
          }
        });
        eqTxt.on('pointerover', () => eqTxt.setColor('#ffffff'));
        eqTxt.on('pointerout', () => eqTxt.setColor('#aaccff'));
      }
    }

    return ROW_H + 18;
  }

  _setupInput() {
    this.input.keyboard.on('keydown-ENTER', () => this._confirm(1));
    this.input.keyboard.on('keydown-SHIFT', () => this._confirm(2));
    this.input.keyboard.on('keydown-ESC', () => {
      playUiBack(this);
      abandonRunToMenu(this);
    });
  }

  _confirm(pid) {
    this._confirmed[pid] = true;
    playUiConfirm(this);
    if (this._confirmed[1] && this._confirmed[2]) {
      this.scene.start('BossScene');
    }
  }
}
