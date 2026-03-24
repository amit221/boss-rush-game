/**
 * Hebrew UI copy (single-locale build).
 */
export const T = {
  gameTitle: 'מרדף בוסים',
  onePlayer: 'שחקן אחד',
  twoPlayers: 'שני שחקנים',
  gameplayHint: 'ירי אוטומטי  •  קרב קרוב אוטומטי  •  החייאת השותף',
  controlsP1Only: 'שחקן 1: WASD',
  controlsP1P2: 'שחקן 1: WASD     שחקן 2: חצים',
  pressEnterStart: '▶ לחצו Enter להתחלה',
  shopFromMenu: 'S — חנות',
  resetProgressHint: 'R — איפוס כל התקדמות הגיבורים',
  resetConfirmPrompt: 'לאפס התקדמות? [Y] אישור  [N] ביטול',
  resetDone: 'ההתקדמות אופסה.',

  selectBoss: 'בחר בוס',
  bossSelectHint: 'A/D לבחירה  •  Q/E עמוד  •  Enter לאישור  •  ESC חזרה',
  bossSelectPage: (n, total) => `עמוד ${n} / ${total}`,
  locked: 'נעול',

  selectCharacter: 'בחר דמות',
  player1Wasd: 'שחקן 1  (WASD)',
  player2Arrows: 'שחקן 2  (חצים)',
  charSelectHintP1: 'A/D לבחירה  •  Enter לאישור  •  ESC חזרה',
  charSelectHintP2: 'שמאל/ימין  •  Shift לאישור  •  ESC חזרה',
  characterConfirmed: (name) => `✓ ${name} נבחר`,

  statHp: (v) => `חיים: ${v}`,
  statSpd: (v) => `מהירות: ${v}`,
  statDmg: (r, m) => `נזק: ${r}/${m}`,

  shopTitle: 'חנות',
  shopPlayer: (pid, charName) => `שחקן ${pid} (${charName})`,
  coins: (n) => `מטבעות: ${n}`,
  weaponStatLine: (dmg, rof, range) => `נזק×${dmg}  קצב×${rof}  טווח${range}`,
  shopMystery: (price) => `קופסת מסתורין — שברים אקראיים [${price}מ׳]`,
  shopBuyShard: (price) => `שבר +1 [${price}מ׳]`,
  shopUnlockCost: (n) => `פתיחה (${n})`,
  shopUpgradeCost: (n) => `שדרוג (${n})`,
  shopEquip: 'ציוד',
  shopShards: (n) => `שברים: ${n}`,
  shopTier: (t) => `רמה ${t}`,
  shopLocked: 'נעול',
  shopDone: (key) => `[${key}] סיום`,
  shopEscHint: 'ESC — יציאה לתפריט (נטישת המשחק)',

  bossEscHint: 'ESC — בחירת דמות',
  hudPlayer: (pid) => `ש${pid}`,

  victoryTitle: 'ניצחון!',
  victoryLine1: 'ניצחתם את כל הבוסים!',
  victoryLine2: 'העולם בטוח… לעת עתה.',
  playAgain: '[ Enter לשחק שוב ]',

  gameOverTitle: 'המשחק נגמר',
  gameOverSolo: 'הגיבור שלך נפל…',
  gameOverCoop: 'שני הגיבורים נפלו…',
  tryAgain: '[ Enter לנסות שוב ]',

  phaseLabel: (n) => `שלב ${n}!`,
};
