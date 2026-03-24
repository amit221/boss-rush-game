import { playSfx } from '../audio/sfx.js';

const FX_DEPTH = 55;

function destroyEmitterAfter(scene, emitter, ms = 600) {
  scene.time.delayedCall(ms, () => {
    if (emitter && emitter.scene) emitter.destroy();
  });
}

/**
 * One-shot additive sparks using the bullet texture (pixel-friendly with pixelArt game).
 */
export function sparkBurst(scene, x, y, opts = {}) {
  const {
    count = 14,
    tint = 0xffaa44,
    speedMin = 45,
    speedMax = 160,
    lifespan = 320,
    angleMin = 0,
    angleMax = 360,
    scaleStart = 0.5,
    blendMode = 'ADD',
  } = opts;

  const emitter = scene.add.particles(0, 0, 'bullet', {
    lifespan,
    speed: { min: speedMin, max: speedMax },
    angle: { min: angleMin, max: angleMax },
    scale: { start: scaleStart, end: 0 },
    alpha: { start: 1, end: 0 },
    tint,
    blendMode,
    emitting: false,
  });
  emitter.setDepth(FX_DEPTH);
  emitter.explode(count, x, y);
  destroyEmitterAfter(scene, emitter, lifespan + 120);
  return emitter;
}

/** Player took damage — short red/orange burst at body. */
export function hurtSparks(scene, x, y) {
  sparkBurst(scene, x, y, {
    count: 10,
    tint: 0xff4422,
    speedMin: 30,
    speedMax: 95,
    lifespan: 260,
    scaleStart: 0.55,
  });
  sparkBurst(scene, x, y, {
    count: 6,
    tint: 0xffaa66,
    speedMin: 20,
    speedMax: 70,
    lifespan: 200,
    scaleStart: 0.35,
  });
}

/** Minion / small enemy death — chunky pop. */
export function deathPopParticles(scene, x, y) {
  sparkBurst(scene, x, y, {
    count: 22,
    tint: 0xcc4422,
    speedMin: 30,
    speedMax: 140,
    lifespan: 380,
    scaleStart: 0.55,
  });
  sparkBurst(scene, x, y, {
    count: 14,
    tint: 0xff8866,
    speedMin: 50,
    speedMax: 200,
    lifespan: 420,
    angleMin: 0,
    angleMax: 360,
    scaleStart: 0.4,
  });
}

/**
 * Melee swing — narrow cone in facing direction (radians; Phaser uses degrees for particles).
 */
export function meleeConeParticles(scene, x, y, facingAngleRad) {
  const mid = Phaser.Math.RadToDeg(facingAngleRad);
  sparkBurst(scene, x, y, {
    count: 16,
    tint: 0xffeeaa,
    speedMin: 70,
    speedMax: 190,
    lifespan: 280,
    angleMin: mid - 38,
    angleMax: mid + 38,
    scaleStart: 0.55,
  });
  sparkBurst(scene, x, y, {
    count: 8,
    tint: 0xffffff,
    speedMin: 90,
    speedMax: 220,
    lifespan: 200,
    angleMin: mid - 22,
    angleMax: mid + 22,
    scaleStart: 0.35,
  });
}

/** Boss defeated — gold / white upward shower + ring bursts. */
export function bossDefeatParticles(scene, x, y) {
  sparkBurst(scene, x, y, {
    count: 40,
    tint: 0xffdd66,
    speedMin: 80,
    speedMax: 260,
    lifespan: 700,
    angleMin: 210,
    angleMax: 330,
    scaleStart: 0.65,
  });
  sparkBurst(scene, x, y, {
    count: 24,
    tint: 0xffffff,
    speedMin: 90,
    speedMax: 220,
    lifespan: 520,
    angleMin: 220,
    angleMax: 320,
    scaleStart: 0.45,
  });
  for (let i = 0; i < 3; i++) {
    const ox = x + (i - 1) * 40;
    const oy = y + 20;
    sparkBurst(scene, ox, oy, {
      count: 18,
      tint: i === 1 ? 0xffaa44 : 0xffcc88,
      speedMin: 40,
      speedMax: 120,
      lifespan: 450,
      angleMin: 0,
      angleMax: 360,
      scaleStart: 0.5,
    });
  }
}

/** Radial burst of tweened sprites + additive sparks (keeps pixel-art look). */
export function hitBurst(scene, x, y, color = 0xffaa44) {
  sparkBurst(scene, x, y, {
    count: 12,
    tint: color,
    speedMin: 40,
    speedMax: 140,
    lifespan: 280,
    scaleStart: 0.48,
  });

  const n = 8;
  for (let i = 0; i < n; i++) {
    const m = scene.add.image(x, y, 'bullet');
    m.setTint(color);
    m.setScale(0.45 + Math.random() * 0.25);
    const a = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.4;
    const d = 28 + Math.random() * 24;
    scene.tweens.add({
      targets: m,
      x: x + Math.cos(a) * d,
      y: y + Math.sin(a) * d,
      alpha: 0,
      scale: 0.15,
      duration: 200 + Math.random() * 80,
      ease: 'Cubic.easeOut',
      onComplete: () => m.destroy(),
    });
  }
}

/**
 * Continuous particle trail that follows a bullet game object.
 * Cleans itself up when the bullet is destroyed.
 */
export function bulletTrail(scene, bullet, visuals) {
  const emitter = scene.add.particles(bullet.x, bullet.y, visuals.bulletTexture ?? 'bullet', {
    follow: bullet,
    frequency: visuals.trailFrequency ?? 60,
    quantity: 1,
    lifespan: 160,
    speed: { min: 0, max: 10 },
    scale: { start: 0.28, end: 0 },
    alpha: { start: 0.65, end: 0 },
    tint: visuals.trailColor ?? 0xffcc66,
    blendMode: 'ADD',
  });
  emitter.setDepth(FX_DEPTH - 5);
  bullet.once('destroy', () => {
    emitter.stopFollow();
    emitter.stop();
    destroyEmitterAfter(scene, emitter, 300);
  });
  return emitter;
}

/**
 * Routes to the correct hit effect based on weapon hitStyle.
 */
export function hitDispatch(scene, x, y, style, color, angleDeg = 0) {
  switch (style) {
    case 'scatter': hitBurstScatter(scene, x, y, color, angleDeg); break;
    case 'flash':   hitBurstFlash(scene, x, y); break;
    case 'slash':   hitBurstSlash(scene, x, y, color, angleDeg); break;
    case 'flame':   hitBurstFlame(scene, x, y); break;
    default:        hitBurst(scene, x, y, color); break;
  }
}

/** Shotgun impact — wide 180° scatter in direction of travel. */
function hitBurstScatter(scene, x, y, color, angleDeg) {
  sparkBurst(scene, x, y, {
    count: 18,
    tint: color,
    speedMin: 55,
    speedMax: 210,
    lifespan: 300,
    angleMin: angleDeg - 90,
    angleMax: angleDeg + 90,
    scaleStart: 0.42,
  });
  sparkBurst(scene, x, y, {
    count: 8,
    tint: 0xffcc44,
    speedMin: 30,
    speedMax: 100,
    lifespan: 200,
    scaleStart: 0.28,
  });
}

/** Sniper impact — white flash burst + expanding shockwave ring. */
function hitBurstFlash(scene, x, y) {
  sparkBurst(scene, x, y, {
    count: 10,
    tint: 0xffffff,
    speedMin: 90,
    speedMax: 270,
    lifespan: 200,
    scaleStart: 0.55,
  });
  sparkBurst(scene, x, y, {
    count: 6,
    tint: 0x88ccff,
    speedMin: 60,
    speedMax: 180,
    lifespan: 260,
    scaleStart: 0.35,
  });
  // Expanding ring
  const ring = scene.add.graphics();
  ring.setDepth(FX_DEPTH);
  ring.lineStyle(2, 0xffffff, 0.9);
  ring.strokeCircle(x, y, 5);
  scene.tweens.add({
    targets: ring,
    alpha: 0,
    scaleX: 5,
    scaleY: 5,
    duration: 220,
    ease: 'Quad.easeOut',
    onComplete: () => ring.destroy(),
  });
}

/** Boomerang impact — narrow directional slash cone in green. */
function hitBurstSlash(scene, x, y, color, angleDeg) {
  sparkBurst(scene, x, y, {
    count: 14,
    tint: color,
    speedMin: 60,
    speedMax: 180,
    lifespan: 260,
    angleMin: angleDeg - 35,
    angleMax: angleDeg + 35,
    scaleStart: 0.5,
  });
  sparkBurst(scene, x, y, {
    count: 6,
    tint: 0xffffff,
    speedMin: 80,
    speedMax: 200,
    lifespan: 180,
    angleMin: angleDeg - 18,
    angleMax: angleDeg + 18,
    scaleStart: 0.3,
  });
}

/** Flamethrower impact — omnidirectional flame splash. */
function hitBurstFlame(scene, x, y) {
  sparkBurst(scene, x, y, {
    count: 16,
    tint: 0xff4400,
    speedMin: 30,
    speedMax: 130,
    lifespan: 360,
    scaleStart: 0.52,
  });
  sparkBurst(scene, x, y, {
    count: 10,
    tint: 0xff9900,
    speedMin: 20,
    speedMax: 80,
    lifespan: 240,
    scaleStart: 0.35,
  });
}

export function meleeArc(scene, x, y, facingAngleRad) {
  const g = scene.add.graphics();
  g.setDepth(FX_DEPTH - 1);
  g.lineStyle(4, 0xffee88, 0.9);
  g.beginPath();
  g.arc(x, y, 36, facingAngleRad - 0.5, facingAngleRad + 0.5, false);
  g.strokePath();
  scene.tweens.add({
    targets: g,
    alpha: 0,
    duration: 120,
    onComplete: () => g.destroy(),
  });
}


export function shakeCameras(scene, duration = 120, intensity = 0.004) {
  scene.cameras.cameras.forEach(cam => {
    if (cam && cam.shake) cam.shake(duration, intensity);
  });
}

export function playHitRanged(scene) { playSfx(scene, 'sfx_hit_ranged', { volume: 0.38 }); }
export function playHitMelee(scene) { playSfx(scene, 'sfx_hit_melee', { volume: 0.42 }); }
export function playHitArmor(scene) { playSfx(scene, 'sfx_hit_armor', { volume: 0.48 }); }
export function playPlayerHurt(scene) { playSfx(scene, 'sfx_player_hurt', { volume: 0.5 }); }
export function playMinionDie(scene) { playSfx(scene, 'sfx_minion_die', { volume: 0.4 }); }
export function playBossDefeat(scene) { playSfx(scene, 'sfx_boss_defeat', { volume: 0.55 }); }
