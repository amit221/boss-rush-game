import { WEAPONS, getShopWeaponIds } from '../data/weapons.js';
import { CHARACTERS } from '../data/characters.js';
import { FONT_FAMILY, addMenuBackdrop, COLORS } from '../ui/theme.js';
import { T } from '../i18n/hebrew.js';
import { abandonRunToMenu } from '../navigation.js';
import { playUiBuy, playUiConfirm, playUiBack } from '../audio/sfx.js';
import { ensureBgm } from '../audio/music.js';
import { createAudioControls } from '../ui/audioControls.js';
import { getShardCoinPrice, MYSTERY_BOX_COIN_PRICE } from '../data/weaponEconomy.js';

const COL_W = 520;
const PAGE_SIZE = 5;
const LIST_TOP = 238;
const ROW_H = 68;
const BTN_W = 78;
const BTN_H = 22;
const BTN_GAP = 6;
const ICON_X_OFF = 16;
const DEPTH_UI = 20;

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
    this._weaponPage = { 1: 0, 2: 0 };
    this._listObjects = { 1: [], 2: [] };
    this._buildUI();
    this._setupInput();
    ensureBgm(this, 'music_menu');
    createAudioControls(this);
  }

  _track(pid, ...objs) {
    objs.forEach((o) => {
      if (o) this._listObjects[pid].push(o);
    });
  }

  _clearList(pid) {
    (this._listObjects[pid] ?? []).forEach((o) => o.destroy());
    this._listObjects[pid] = [];
  }

  _refreshList(pid, charId, ox, left) {
    this._clearList(pid);
    this._drawPagedWeapons(pid, charId, ox, left);
  }

  _addRectBtn(pid, cx, cy, w, h, label, enabled, onClick) {
    const fill = enabled ? 0x2a1a0e : 0x140c08;
    const stroke = enabled ? COLORS.strokeBright : 0x3a3530;
    const r = this.add.rectangle(cx, cy, w, h, fill, 0.96)
      .setStrokeStyle(2, stroke)
      .setScrollFactor(0)
      .setDepth(DEPTH_UI);
    const t = this.add.text(cx, cy, label, {
      fontFamily: FONT_FAMILY,
      fontSize: '9px',
      color: enabled ? '#ffeecc' : '#555555',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI + 1);
    this._track(pid, r, t);
    if (enabled) {
      r.setInteractive({ useHandCursor: true });
      r.on('pointerover', () => r.setFillStyle(0x3d2812));
      r.on('pointerout', () => r.setFillStyle(0x2a1a0e));
      r.on('pointerdown', () => {
        onClick();
      });
    }
  }

  _buildUI() {
    const sm = this._sm;
    const chars = this.registry.get('selectedCharacters') ?? { 1: 'brute', 2: 'scout' };
    addMenuBackdrop(this);
    this.add.rectangle(640, 360, 1240, 680, 0x000000, 0.22).setDepth(-9).setScrollFactor(0);
    this.add.text(640, 28, T.shopTitle, {
      fontFamily: FONT_FAMILY,
      fontSize: '28px',
      color: '#ffdd88',
      stroke: '#4a3510', strokeThickness: 5,
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI);

    const pids = this._playerCount === 1 ? [1] : [1, 2];
    pids.forEach((pid) => {
      const charId = chars[pid];
      if (!charId) return;
      const ox = this._playerCount === 1 ? 640 : (pid === 1 ? 320 : 960);
      const color = pid === 1 ? '#6699ff' : '#ff9966';
      const left = ox - COL_W / 2;
      const right = ox + COL_W / 2;

      const charName = CHARACTERS[charId]?.name ?? charId;
      this.add.text(ox, 64, T.shopPlayer(pid, charName), {
        fontFamily: FONT_FAMILY, fontSize: '14px', color,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI);

      this.add.text(ox, 86, T.coins(sm.getCoins(charId)), {
        fontFamily: FONT_FAMILY, fontSize: '12px', color: '#ffdd00',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI);

      const curId = sm.getEquippedWeapon(charId);
      const curName = WEAPONS[curId]?.name ?? curId;
      this.add.rectangle(ox, 108, COL_W - 24, 30, 0x0f0804, 0.9)
        .setStrokeStyle(2, COLORS.strokeBright, 0.55)
        .setScrollFactor(0).setDepth(DEPTH_UI - 1);
      this.add.text(ox, 108, T.shopActiveWeapon(curName), {
        fontFamily: FONT_FAMILY,
        fontSize: '12px',
        color: curId === 'default' ? '#c8b898' : '#88ffaa',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI);

      this.add.text(ox, 138, T.shopHintActions, {
        fontFamily: FONT_FAMILY,
        fontSize: '7px',
        color: '#666666',
      }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI);

      this._addDefaultRow(pid, charId, ox, left, right);
      this._addMysteryRow(charId, ox);

      this._drawPagedWeapons(pid, charId, ox, left);
    });

    if (this._playerCount === 2) {
      this.add.line(640, 360, 0, -360, 0, 360, 0x3a4860).setLineWidth(2).setScrollFactor(0);
    }

    pids.forEach((pid) => {
      const ox = this._playerCount === 1 ? 640 : (pid === 1 ? 320 : 960);
      const doneColor = this._confirmed?.[pid] ? '#44ff44' : '#ffffff';
      const doneKey = pid === 1 ? 'ENTER' : 'SHIFT';
      this.add.text(ox, 668, T.shopDone(doneKey), {
        fontFamily: FONT_FAMILY, fontSize: '12px', color: doneColor,
      }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI);
    });

    this.add.text(640, 698, T.shopEscHint, {
      fontFamily: FONT_FAMILY,
      fontSize: '8px', color: '#666666',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI);
  }

  _addDefaultRow(pid, charId, ox, left, right) {
    const sm = this._sm;
    const y = 146;
    const w = WEAPONS.default;
    const equipped = sm.getEquippedWeapon(charId) === 'default';

    this.add.rectangle(ox, y + 22, COL_W - 16, 44, 0x120a06, 0.88)
      .setStrokeStyle(1, 0x4a3518, 0.7)
      .setScrollFactor(0).setDepth(DEPTH_UI - 1);

    this.add.image(left + ICON_X_OFF, y + 6, 'icon_weapon_default')
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH_UI);

    const nameCol = equipped ? '#77ff99' : '#eeeeee';
    this.add.text(left + 50, y + 4, w.name, {
      fontFamily: FONT_FAMILY, fontSize: '12px', color: nameCol,
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH_UI);

    this.add.text(left + 50, y + 20, weaponStatLine(w), {
      fontFamily: FONT_FAMILY, fontSize: '7px', color: '#777777',
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH_UI);

    const btnRight = right - 12 - BTN_W / 2;
    this._addRectBtn(
      pid,
      btnRight,
      y + 22,
      BTN_W,
      BTN_H,
      T.shopEquip,
      !equipped,
      () => {
        if (sm.setEquippedWeapon(charId, 'default')) {
          playUiConfirm(this);
          this.scene.restart();
        }
      },
    );
  }

  _addMysteryRow(charId, ox) {
    const sm = this._sm;
    const y = 198;
    const can = sm.getCoins(charId) >= MYSTERY_BOX_COIN_PRICE;

    this.add.rectangle(ox, y + 14, COL_W - 16, 32, 0x180818, 0.9)
      .setStrokeStyle(1, can ? 0x8866aa : 0x333333)
      .setScrollFactor(0).setDepth(DEPTH_UI - 1);

    const cx = ox;
    const cy = y + 14;
    const r = this.add.rectangle(cx, cy, COL_W - 20, 28, can ? 0x2a1530 : 0x120812, 0.95)
      .setStrokeStyle(2, can ? 0xaa77cc : 0x444444)
      .setScrollFactor(0).setDepth(DEPTH_UI);
    const t = this.add.text(cx, cy, T.shopMystery(MYSTERY_BOX_COIN_PRICE), {
      fontFamily: FONT_FAMILY,
      fontSize: '11px',
      color: can ? '#eeccff' : '#555555',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI + 1);
    if (can) {
      r.setInteractive({ useHandCursor: true });
      r.on('pointerover', () => r.setFillStyle(0x3a2048));
      r.on('pointerout', () => r.setFillStyle(0x2a1530));
      r.on('pointerdown', () => {
        if (sm.buyMysteryBox(charId)) {
          playUiBuy(this);
          this.scene.restart();
        }
      });
    }
  }

  _drawPagedWeapons(pid, charId, ox, left) {
    const sm = this._sm;
    const right = ox + COL_W / 2;
    const ids = sortedShopWeaponIds();
    const nPages = Math.max(1, Math.ceil(ids.length / PAGE_SIZE));
    this._weaponPage[pid] = Phaser.Math.Clamp(this._weaponPage[pid] ?? 0, 0, nPages - 1);
    const page = this._weaponPage[pid];
    const slice = ids.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

    slice.forEach((weaponId, i) => {
      const rowTop = LIST_TOP + i * ROW_H;
      this._drawWeaponRow(pid, charId, ox, left, right, rowTop, weaponId);
    });

    const navY = LIST_TOP + PAGE_SIZE * ROW_H + 12;
    const pageLabel = this.add.text(ox, navY, T.shopPage(page + 1, nPages), {
      fontFamily: FONT_FAMILY,
      fontSize: '10px',
      color: '#999999',
    }).setOrigin(0.5).setScrollFactor(0).setDepth(DEPTH_UI);
    this._track(pid, pageLabel);

    if (nPages > 1) {
      this._addRectBtn(pid, ox - 72, navY, 64, 22, T.shopPrev, page > 0, () => {
        this._weaponPage[pid] = page - 1;
        this._refreshList(pid, charId, ox, left);
      });
      this._addRectBtn(pid, ox + 72, navY, 64, 22, T.shopNext, page < nPages - 1, () => {
        this._weaponPage[pid] = page + 1;
        this._refreshList(pid, charId, ox, left);
      });
    }
  }

  _drawWeaponRow(pid, charId, ox, left, right, rowTop, weaponId) {
    const sm = this._sm;
    const w = WEAPONS[weaponId];
    const tier = sm.getWeaponTier(charId, weaponId);
    const shards = sm.getShardCount(charId, weaponId);
    const need = sm.shardsNeededForNext(charId, weaponId);
    const equipped = sm.getEquippedWeapon(charId) === weaponId;
    const price = getShardCoinPrice(weaponId);
    const canBuyShard = sm.getCoins(charId) >= price;
    const canAdvance = shards >= need;

    const cy = rowTop + ROW_H / 2 - 2;
    const bg = this.add.rectangle(ox, cy, COL_W - 16, ROW_H - 4, equipped ? 0x0e1a0e : 0x0c0a08, 0.92)
      .setStrokeStyle(2, equipped ? 0x44aa44 : 0x3a3020, equipped ? 0.9 : 0.5)
      .setScrollFactor(0).setDepth(DEPTH_UI - 1);
    this._track(pid, bg);

    const img = this.add.image(left + ICON_X_OFF, rowTop + 8, `icon_weapon_${weaponId}`)
      .setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH_UI);
    this._track(pid, img);

    const nameCol = equipped ? '#66ff88' : '#ffffff';
    const tName = this.add.text(left + 48, rowTop + 6, w.name, {
      fontFamily: FONT_FAMILY, fontSize: '11px', color: nameCol,
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH_UI);
    this._track(pid, tName);

    const tStat = this.add.text(left + 48, rowTop + 22, weaponStatLine(w), {
      fontFamily: FONT_FAMILY, fontSize: '7px', color: '#777777',
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH_UI);
    this._track(pid, tStat);

    const tierLabel = tier < 0 ? T.shopLocked : T.shopTier(tier);
    const tMeta = this.add.text(left + 48, rowTop + 34, `${T.shopShards(shards)}  ·  ${tierLabel}`, {
      fontFamily: FONT_FAMILY,
      fontSize: '8px',
      color: '#999999',
    }).setOrigin(0, 0).setScrollFactor(0).setDepth(DEPTH_UI);
    this._track(pid, tMeta);

    let xBtn = right - 12 - BTN_W / 2;
    const btnY = rowTop + ROW_H - 18;

    if (tier >= 0) {
      this._addRectBtn(
        pid,
        xBtn,
        btnY,
        BTN_W,
        BTN_H,
        T.shopEquip,
        !equipped,
        () => {
          if (sm.setEquippedWeapon(charId, weaponId)) {
            playUiConfirm(this);
            this.scene.restart();
          }
        },
      );
      xBtn -= BTN_W + BTN_GAP;
    }

    const advLabel = tier < 0 ? T.shopUnlockCost(need) : T.shopUpgradeCost(need);
    this._addRectBtn(
      pid,
      xBtn,
      btnY,
      BTN_W + 10,
      BTN_H,
      advLabel,
      canAdvance,
      () => {
        if (sm.advanceWeaponWithShards(charId, weaponId)) {
          playUiBuy(this);
          this.scene.restart();
        }
      },
    );
    xBtn -= BTN_W + 10 + BTN_GAP;

    this._addRectBtn(
      pid,
      xBtn,
      btnY,
      BTN_W + 6,
      BTN_H,
      T.shopBuyShard(price),
      canBuyShard,
      () => {
        if (sm.buyWeaponShard(charId, weaponId)) {
          playUiBuy(this);
          this.scene.restart();
        }
      },
    );
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
