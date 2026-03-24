# Player Mode Selection Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 1-player vs 2-player mode selection to the title screen so a solo player can play the full game with a single character and full-screen camera.

**Architecture:** Store `playerCount` (1 or 2) in Phaser's global registry when the player confirms their choice on the menu screen. Every downstream scene reads this value and branches accordingly. No new scenes are added — existing scenes become conditional on `playerCount`. The registry key persists across scene transitions so player count stays consistent for the entire play session.

**Tech Stack:** Phaser 3.60.0, ES6 modules, Arcade Physics, Jest (for ShopManager/CombatSystem unit tests — Phaser scenes verified manually).

---

## File Map

| File | Change | Lines affected |
|------|--------|----------------|
| `src/scenes/MenuScene.js` | Add 1P/2P mode toggle with LEFT/RIGHT keys | 54-75 |
| `src/scenes/CharacterSelectScene.js` | Skip P2 panel and confirm when playerCount=1 | create(), _confirmPlayer() |
| `src/scenes/BossScene.js` | Conditional player2, full-screen camera, 1P game-over, guarded HUD/update | create(), _setupCameras(), _setupHUD(), _updateHUD(), _onBossDefeated(), update() |
| `src/scenes/ShopScene.js` | Single-column centered layout, pre-confirm P2 when playerCount=1 | create(), _buildUI() |
| `src/scenes/GameOverScene.js` | Conditional "Both heroes fell" message | create() line 11 |

`Player.js`, `ShopManager.js`, `CombatSystem.js`, `BaseBoss.js` — **no changes needed**.

---

### Task 1: Mode selection in MenuScene

**Files:**
- Modify: `src/scenes/MenuScene.js`

Currently line 54 has a static `'2-Player Co-op'` subtitle and line 71 uses `.once('keydown-ENTER', ...)` which can't track LEFT/RIGHT. We replace the subtitle with an interactive toggle and switch to persistent key listeners.

- [ ] **Step 1: Replace lines 54-75 with mode selector**

Replace this block in `MenuScene.create()`:

```javascript
    this.add.text(cx, cy - 60, '2-Player Co-op', {
      fontSize: '28px', color: '#aaaaaa'
    }).setOrigin(0.5);

    const startBtn = this.add.text(cx, cy + 40, '[ PRESS ENTER TO START ]', {
      fontSize: '28px', color: '#44ff44'
    }).setOrigin(0.5);
    this.tweens.add({ targets: startBtn, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    this.add.text(cx, cy + 130, 'Player 1: WASD     Player 2: Arrow Keys', {
      fontSize: '18px', color: '#888888'
    }).setOrigin(0.5);

    this.add.text(cx, cy + 165, 'Auto-fire  •  Auto-melee  •  Revive your teammate', {
      fontSize: '16px', color: '#666666'
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-ENTER', () => {
      this.registry.set('shopManager', createShopManager());
      this.registry.set('bossIndex', 0);
      this.scene.start('CharacterSelectScene');
    });
```

With:

```javascript
    // Mode selection
    this._playerCount = 2;
    const opt1 = this.add.text(cx - 110, cy - 60, '1 Player',  { fontSize: '26px', color: '#aaaaaa' }).setOrigin(0.5);
    const opt2 = this.add.text(cx + 110, cy - 60, '2 Players', { fontSize: '26px', color: '#ffffff' }).setOrigin(0.5);

    const controlsHint = this.add.text(cx, cy + 130, '', { fontSize: '18px', color: '#888888' }).setOrigin(0.5);
    this.add.text(cx, cy + 165, 'Auto-fire  •  Auto-melee  •  Revive your teammate', {
      fontSize: '16px', color: '#666666'
    }).setOrigin(0.5);

    const updateMode = () => {
      opt1.setColor(this._playerCount === 1 ? '#ffffff' : '#aaaaaa');
      opt2.setColor(this._playerCount === 2 ? '#ffffff' : '#aaaaaa');
      controlsHint.setText(
        this._playerCount === 1
          ? 'Player 1: WASD'
          : 'Player 1: WASD     Player 2: Arrow Keys'
      );
    };
    updateMode();

    const startBtn = this.add.text(cx, cy + 40, '[ PRESS ENTER TO START ]', {
      fontSize: '28px', color: '#44ff44'
    }).setOrigin(0.5);
    this.tweens.add({ targets: startBtn, alpha: 0.2, duration: 600, yoyo: true, repeat: -1 });

    this.input.keyboard.on('keydown-LEFT',  () => { this._playerCount = 1; updateMode(); });
    this.input.keyboard.on('keydown-RIGHT', () => { this._playerCount = 2; updateMode(); });
    this.input.keyboard.once('keydown-ENTER', () => {
      this.registry.set('playerCount', this._playerCount);
      this.registry.set('shopManager', createShopManager());
      this.registry.set('bossIndex', 0);
      this.scene.start('CharacterSelectScene');
    });
```

- [ ] **Step 2: Verify manually**

Open the game in the browser (Live Server on `index.html`).
- Title screen shows "1 Player" (grey) and "2 Players" (white) side by side
- LEFT arrow highlights "1 Player"; RIGHT arrow highlights "2 Players"
- Controls hint updates live
- ENTER proceeds to CharacterSelectScene

- [ ] **Step 3: Commit**

```bash
git add src/scenes/MenuScene.js
git commit -m "feat: add 1P/2P mode selector on menu screen"
```

---

### Task 2: CharacterSelectScene — skip P2 in 1-player mode

**Files:**
- Modify: `src/scenes/CharacterSelectScene.js`

Two changes needed:
1. Collect all P2 UI elements so they can be hidden
2. Skip same-character conflict check and set a valid P2 default in `_confirmPlayer`

- [ ] **Step 1: Collect P2 elements and hide them in 1P mode**

In `create()`, add `this._playerCount` read at the top, collect P2 elements, and hide them when in 1P:

Replace the top of `create()` through the end of the `chars.forEach` block:

```javascript
  create() {
    const chars = Object.values(CHARACTERS);
    this._p1Index = 0;
    this._p2Index = 1;
    this._confirmed = { 1: false, 2: false };
    this._playerCount = this.registry.get('playerCount') ?? 2;
    this._p2Els = [];

    this.add.text(640, 35, 'SELECT YOUR CHARACTER', {
      fontSize: '36px', color: '#ffffff', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(320, 90, 'PLAYER 1  (WASD)', { fontSize: '20px', color: '#4488ff' }).setOrigin(0.5);
    this._p2Els.push(
      this.add.text(960, 90, 'PLAYER 2  (ARROWS)', { fontSize: '20px', color: '#ff8844' }).setOrigin(0.5)
    );

    // Draw character cards for both sides
    this._cards1 = [];
    this._cards2 = [];
    chars.forEach((char, i) => {
      const x1 = 180 + i * 260;
      const x2 = x1 + 640;
      const y = 360;

      // P1 card
      const bg1 = this.add.rectangle(x1, y, 200, 240, 0x222244);
      this.add.rectangle(x1, y - 60, 60, 60, char.color);
      this.add.text(x1, y + 10, char.name, { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);
      this.add.text(x1, y + 45, `HP: ${char.hp}`, { fontSize: '14px', color: '#aaaaaa' }).setOrigin(0.5);
      this.add.text(x1, y + 65, `SPD: ${char.speed}`, { fontSize: '14px', color: '#aaaaaa' }).setOrigin(0.5);
      this.add.text(x1, y + 85, `DMG: ${char.rangedDamage}/${char.meleeDamage}`, { fontSize: '14px', color: '#aaaaaa' }).setOrigin(0.5);
      this._cards1.push(bg1);

      // P2 card — collect all elements for hiding
      const bg2     = this.add.rectangle(x2, y, 200, 240, 0x442222);
      const color2  = this.add.rectangle(x2, y - 60, 60, 60, char.color);
      const name2   = this.add.text(x2, y + 10, char.name, { fontSize: '22px', color: '#ffffff' }).setOrigin(0.5);
      const hp2     = this.add.text(x2, y + 45, `HP: ${char.hp}`, { fontSize: '14px', color: '#aaaaaa' }).setOrigin(0.5);
      const spd2    = this.add.text(x2, y + 65, `SPD: ${char.speed}`, { fontSize: '14px', color: '#aaaaaa' }).setOrigin(0.5);
      const dmg2    = this.add.text(x2, y + 85, `DMG: ${char.rangedDamage}/${char.meleeDamage}`, { fontSize: '14px', color: '#aaaaaa' }).setOrigin(0.5);
      this._cards2.push(bg2);
      this._p2Els.push(bg2, color2, name2, hp2, spd2, dmg2);
    });

    // Cursor outlines
    this._cursor1 = this.add.rectangle(0, 360, 204, 244, 0x4488ff, 0).setStrokeStyle(3, 0x4488ff);
    this._cursor2 = this.add.rectangle(0, 360, 204, 244, 0xff8844, 0).setStrokeStyle(3, 0xff8844);
    this._p2Els.push(this._cursor2);

    // Status texts
    this._status1 = this.add.text(320, 590, 'A/D to select  •  ENTER to confirm', { fontSize: '15px', color: '#4488ff' }).setOrigin(0.5);
    this._status2 = this.add.text(960, 590, 'LEFT/RIGHT to select  •  SHIFT to confirm', { fontSize: '15px', color: '#ff8844' }).setOrigin(0.5);
    this._p2Els.push(this._status2);

    if (this._playerCount === 1) {
      this._p2Els.forEach(el => el.setVisible(false));
      this._confirmed[2] = true;
    }

    this._updateCursors(chars);
    this._setupInput(chars);
  }
```

- [ ] **Step 2: Fix `_confirmPlayer` for 1P mode**

Replace the entire `_confirmPlayer` method:

```javascript
  _confirmPlayer(pid, charId, chars) {
    // In 2P mode, prevent both players picking the same character
    if (this._playerCount === 2) {
      const otherId = pid === 1 ? chars[this._p2Index]?.id : chars[this._p1Index]?.id;
      if (otherId === charId) return;
    }

    this._confirmed[pid] = true;
    const label = pid === 1 ? this._status1 : this._status2;
    label.setText(`✓ ${charId.toUpperCase()} CONFIRMED`).setColor('#44ff44');

    if (this._confirmed[1] && this._confirmed[2]) {
      this.registry.set('selectedCharacters', {
        1: chars[this._p1Index].id,
        2: this._playerCount === 1 ? 'scout' : chars[this._p2Index].id
      });
      this.time.delayedCall(400, () => this.scene.start('BossScene'));
    }
  }
```

- [ ] **Step 3: Verify manually**

- **1P mode**: Only left panel visible. P1 selects any character (including scout). ENTER starts game immediately.
- **2P mode**: Both panels visible, both must confirm, same-character blocked — unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/CharacterSelectScene.js
git commit -m "feat: skip P2 selection panel in 1-player mode"
```

---

### Task 3: BossScene — full 1-player support

**Files:**
- Modify: `src/scenes/BossScene.js`

Six distinct areas need changes. Read the file alongside this plan.

- [ ] **Step 1: Read playerCount and guard player2 creation (lines 23-38)**

Replace lines 23-38 (`create()` top section, players block):

```javascript
  create() {
    const reg = this.registry;
    this.bossIndex = reg.get('bossIndex') ?? 0;
    this.shopManager = reg.get('shopManager');
    this._playerCount = reg.get('playerCount') ?? 2;
    const chars = reg.get('selectedCharacters') ?? { 1: 'brute', 2: 'scout' };

    // Arena
    this.physics.world.setBounds(0, 0, 1600, 1200);
    this.add.rectangle(800, 600, 1600, 1200, 0x1a1a2e);

    // Players
    this.player1 = new Player(this, 600, 600, 1, chars[1], this.shopManager);
    if (this._playerCount === 2) {
      this.player2 = new Player(this, 1000, 600, 2, chars[2], this.shopManager);
    }
    this.players = this._playerCount === 2 ? [this.player1, this.player2] : [this.player1];
    this._p1Keys = this.player1.getKeys(this);
    if (this._playerCount === 2) this._p2Keys = this.player2.getKeys(this);
```

- [ ] **Step 2: Fix boss-bullets overlap to not include undefined player2 (line 79)**

Replace:
```javascript
    this.physics.add.overlap(this.bossBullets, [this.player1, this.player2], (bullet, player) => {
```
With:
```javascript
    this.physics.add.overlap(this.bossBullets, this.players, (bullet, player) => {
```

(`this.players` is already the correctly filtered array from Step 1.)

- [ ] **Step 3: Rewrite `_setupCameras()` (lines 143-154)**

Replace entire method:

```javascript
  _setupCameras() {
    if (this._playerCount === 2) {
      this.cameras.main.setViewport(0, 0, 640, 720);
      this.cameras.main.setBounds(0, 0, 1600, 1200);
      this.cameras.main.startFollow(this.player1);
      this.cam2 = this.cameras.add(640, 0, 640, 720);
      this.cam2.setBounds(0, 0, 1600, 1200);
      this.cam2.startFollow(this.player2);
      this.add.rectangle(640, 360, 4, 720, 0xffffff).setScrollFactor(0).setDepth(200);
    } else {
      this.cameras.main.setViewport(0, 0, 1280, 720);
      this.cameras.main.setBounds(0, 0, 1600, 1200);
      this.cameras.main.startFollow(this.player1);
    }
  }
```

- [ ] **Step 4: Guard P2 HUD in `_setupHUD()` and `_updateHUD()` (lines 156-169)**

Replace both methods:

```javascript
  _setupHUD() {
    this.add.rectangle(120, 700, 200, 14, 0x333333).setScrollFactor(0).setDepth(99);
    this._p1HpBar = this.add.rectangle(20, 700, 200, 14, 0x44ff44).setScrollFactor(0).setDepth(100).setOrigin(0, 0.5);
    this._p1Label = this.add.text(20, 685, 'P1', { fontSize: '12px', color: '#4488ff' }).setScrollFactor(0).setDepth(100);
    if (this._playerCount === 2) {
      this.add.rectangle(760, 700, 200, 14, 0x333333).setScrollFactor(0).setDepth(99);
      this._p2HpBar = this.add.rectangle(660, 700, 200, 14, 0x44ff44).setScrollFactor(0).setDepth(100).setOrigin(0, 0.5);
      this._p2Label = this.add.text(660, 685, 'P2', { fontSize: '12px', color: '#ff8844' }).setScrollFactor(0).setDepth(100);
    }
  }

  _updateHUD() {
    this._p1HpBar.scaleX = Math.max(0, this.player1.hp / this.player1.maxHp);
    if (this._playerCount === 2 && this.player2) {
      this._p2HpBar.scaleX = Math.max(0, this.player2.hp / this.player2.maxHp);
    }
  }
```

- [ ] **Step 5: Award coins only to P1 in 1P mode in `_onBossDefeated()` (lines 297-305)**

Replace the `[1, 2].forEach` coin-award block:

```javascript
    const pids = this._playerCount === 2 ? [1, 2] : [1];
    pids.forEach(pid => {
      const myDamage = pid === 1 ? this._p1Damage : this._p2Damage;
      const survived = pid === 1 ? this._p1Survived : this._p2Survived;
      this.shopManager.awardBossCoins(pid, {
        survived,
        underTime: elapsed < 90,
        mostDamage: totalDamage > 0 && (myDamage / totalDamage) >= 0.5
      });
    });
```

- [ ] **Step 6: Guard player2 in `update()` (lines 325-350)**

Replace entire `update()` method:

```javascript
  update(time, delta) {
    this._checkRevive(delta);
    this._updateHUD();
    if (!this.boss) return;

    const allMinions = [
      ...this.minions.getChildren().filter(m => m.active),
      ...(this._shadowClones ?? []).filter(c => c.active)
    ];

    const p1Target = !this.player1.isDowned ? findTarget(this.player1, this.boss, allMinions) : null;
    this.player1.update(time, delta, this._p1Keys, p1Target);

    if (this._playerCount === 2 && this.player2) {
      const p2Target = !this.player2.isDowned ? findTarget(this.player2, this.boss, allMinions) : null;
      this.player2.update(time, delta, this._p2Keys, p2Target);
    }

    // Apply ink slow from Kraken
    this.players.forEach(p => {
      if (!p.isDowned && p._inInk && p.body) {
        p.body.velocity.x *= 0.5;
        p.body.velocity.y *= 0.5;
      }
    });

    if (this.boss.update) this.boss.update(time, delta, this.players);
  }
```

> **Note:** `_checkRevive()` and `_onPlayerDowned()` need no changes. `_onPlayerDowned` uses `this.players.find(p => p !== player)` — in 1P mode, `this.players = [this.player1]`, so finding a player other than player1 returns `undefined`, `!other` is `true`, and game over triggers immediately. Correct behavior.

- [ ] **Step 7: Verify manually**

- **1P**: Full-screen arena, single player on screen. Killing player1 triggers game over. Boss defeated → shop/victory. No crashes.
- **2P**: Split-screen unchanged. Both players appear, revive works.

- [ ] **Step 8: Run tests**

```bash
npm test
```

Expected: all tests pass (CombatSystem and ShopManager tests are unaffected).

- [ ] **Step 9: Commit**

```bash
git add src/scenes/BossScene.js
git commit -m "feat: support 1-player mode in BossScene (full-screen camera, guarded P2 refs)"
```

---

### Task 4: ShopScene — centered single-column layout for 1P

**Files:**
- Modify: `src/scenes/ShopScene.js`

In 1P mode: loop only for pid=1, center P1 panel (offset becomes 320 instead of 0), skip divider, pre-confirm P2.

- [ ] **Step 1: Pre-confirm P2 and read playerCount in `create()`**

Replace `create()`:

```javascript
  create() {
    this._sm = this.registry.get('shopManager');
    this._playerCount = this.registry.get('playerCount') ?? 2;
    this._confirmed = { 1: false, 2: this._playerCount === 1 };
    this._buildUI();
    this._setupInput();
  }
```

- [ ] **Step 2: Loop only over active players and center P1 panel in `_buildUI()`**

Replace the `[1, 2].forEach(pid =>` block and divider line. The full `_buildUI()`:

```javascript
  _buildUI() {
    const sm = this._sm;
    this.add.rectangle(640, 360, 1280, 720, 0x0a0a1a);
    this.add.text(640, 30, 'SHOP', { fontSize: '52px', color: '#ffdd00', fontStyle: 'bold' }).setOrigin(0.5);

    const pids = this._playerCount === 1 ? [1] : [1, 2];
    pids.forEach(pid => {
      // In 1P mode center the panel; in 2P keep left/right halves
      const ox = this._playerCount === 1 ? 320 : (pid === 1 ? 0 : 640);
      const color = pid === 1 ? '#4488ff' : '#ff8844';

      this.add.text(ox + 320, 80, `PLAYER ${pid}`, { fontSize: '24px', color }).setOrigin(0.5);
      this.add.text(ox + 320, 110, `Coins: ${sm.getCoins(pid)}`, { fontSize: '20px', color: '#ffdd00' }).setOrigin(0.5);

      // Divider
      this.add.line(ox + 320, 135, 0, 0, 240, 0, 0x444444);

      // Weapons
      this.add.text(ox + 320, 155, '— WEAPONS —', { fontSize: '14px', color: '#888888' }).setOrigin(0.5);
      let y = 180;
      const shopWeapons = Object.values(WEAPONS).filter(w => w.price > 0);
      shopWeapons.forEach(w => {
        const equipped = sm.getEquippedWeapon(pid) === w.id;
        const canAfford = sm.getCoins(pid) >= w.price;
        const col = equipped ? '#44ff44' : canAfford ? '#ffffff' : '#555555';
        const label = `${w.name}  [${w.price}c]${equipped ? ' ✓' : ''}`;
        const t = this.add.text(ox + 320, y, label, { fontSize: '15px', color: col }).setOrigin(0.5);
        if (!equipped) {
          t.setInteractive({ useHandCursor: true });
          t.on('pointerdown', () => {
            if (sm.buyWeapon(pid, w.id)) this.scene.restart();
          });
          t.on('pointerover', () => { if (canAfford) t.setColor('#ffff88'); });
          t.on('pointerout', () => t.setColor(col));
        }
        y += 28;
      });

      // Upgrades
      y += 10;
      this.add.text(ox + 320, y, '— UPGRADES —', { fontSize: '14px', color: '#888888' }).setOrigin(0.5);
      y += 25;
      UPGRADES.forEach(u => {
        const count = sm.getUpgradeCount(pid, u.id);
        const maxed = count >= 3;
        const canAfford = sm.getCoins(pid) >= u.price;
        const col = maxed ? '#555555' : canAfford ? '#ffffff' : '#555555';
        const label = `${u.name}  [${u.price}c]  ${count}/3`;
        const t = this.add.text(ox + 320, y, label, { fontSize: '14px', color: col }).setOrigin(0.5);
        if (!maxed) {
          t.setInteractive({ useHandCursor: true });
          t.on('pointerdown', () => {
            if (sm.buyUpgrade(pid, u.id)) this.scene.restart();
          });
          t.on('pointerover', () => { if (canAfford) t.setColor('#ffff88'); });
          t.on('pointerout', () => t.setColor(col));
        }
        y += 26;
      });

      // Done button
      const doneColor = this._confirmed?.[pid] ? '#44ff44' : '#ffffff';
      const doneKey = pid === 1 ? 'ENTER' : 'SHIFT';
      this.add.text(ox + 320, 670, `[${doneKey}] Done`, { fontSize: '20px', color: doneColor }).setOrigin(0.5);
    });

    // Center divider — only in 2P
    if (this._playerCount === 2) {
      this.add.line(640, 360, 0, -360, 0, 360, 0x333333).setLineWidth(2);
    }
  }
```

- [ ] **Step 3: Verify manually**

- **1P**: Shop shows a single centered panel. Buying items and pressing ENTER proceeds immediately.
- **2P**: Split-screen shop unchanged.

- [ ] **Step 4: Commit**

```bash
git add src/scenes/ShopScene.js
git commit -m "feat: centered single-column shop layout for 1-player mode"
```

---

### Task 5: GameOverScene — conditional message

**Files:**
- Modify: `src/scenes/GameOverScene.js`

Line 11 hard-codes "Both heroes fell..." which is wrong for 1P.

- [ ] **Step 1: Make the message conditional**

Replace line 11-13 in `create()`:

```javascript
    const playerCount = this.registry.get('playerCount') ?? 2;
    this.add.text(cx, cy, playerCount === 1 ? 'Your hero fell...' : 'Both heroes fell...', {
      fontSize: '28px', color: '#aaaaaa'
    }).setOrigin(0.5);
```

- [ ] **Step 2: Verify manually**

- Die in 1P mode → "Your hero fell..."
- Die in 2P mode → "Both heroes fell..."

- [ ] **Step 3: Commit**

```bash
git add src/scenes/GameOverScene.js
git commit -m "feat: conditional game-over message for 1P vs 2P mode"
```

---

## Done Criteria

- [ ] Menu shows "1 Player" and "2 Players" toggle; LEFT/RIGHT switches; ENTER confirms and stores `playerCount` in registry
- [ ] 1P: CharacterSelect shows only P1 panel; P1 can pick any character; game starts on P1 confirm
- [ ] 1P: BossScene uses full-screen camera; only player1 exists; game over when P1 dies; coins awarded to P1 only
- [ ] 1P: Shop shows centered single panel; ENTER proceeds immediately
- [ ] 1P: GameOver shows "Your hero fell..."
- [ ] 2P: All original behavior identical to before
- [ ] `npm test` passes
