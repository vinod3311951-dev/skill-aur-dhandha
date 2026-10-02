const DESIGN_WIDTH = 960;
const DESIGN_HEIGHT = 540;

let game = null;
let activeScene = null;
let activationObjects = [];
let resizeObserver = null;

function reducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

function cover(image, width, height) {
  const sx = width / image.width;
  const sy = height / image.height;
  const scale = Math.max(sx, sy);
  image.setScale(scale);
  image.setPosition(width * 0.5, height * 0.5);
}

class GlacierReferenceScene extends Phaser.Scene {
  constructor() {
    super('GlacierReferenceScene');
  }

  preload() {
    this.load.svg('glacier-world', '/assets/worlds/glacier-reach.svg', { width: 1920, height: 1080 });
    this.load.svg('captain-rudraa', '/assets/characters/captain-rudraa.svg', { width: 512, height: 512 });
  }

  create() {
    activeScene = this;
    activationObjects = [];

    const w = DESIGN_WIDTH;
    const h = DESIGN_HEIGHT;
    const bg = this.add.image(w * 0.5, h * 0.5, 'glacier-world').setOrigin(0.5).setDepth(0);
    cover(bg, w, h);

    // Subtle light/fog layers add motion without disturbing deterministic aim geometry.
    const dawn = this.add.ellipse(152, 88, 360, 190, 0xffc98b, 0.09).setDepth(1);
    const hazeA = this.add.ellipse(315, 222, 500, 74, 0xe5fbff, 0.08).setDepth(2);
    const hazeB = this.add.ellipse(720, 244, 610, 86, 0xd9f5f7, 0.06).setDepth(2);

    // Captain Rudraa is decorative presentation only; gameplay truth remains independent.
    const rudraa = this.add.image(92, 416, 'captain-rudraa')
      .setOrigin(0.5, 0.5)
      .setDisplaySize(184, 184)
      .setDepth(9)
      .setAlpha(0.97);
    const heroShadow = this.add.ellipse(92, 506, 145, 24, 0x071216, 0.38).setDepth(8);

    // Authored integrated relay at exact mission target coordinate x=.68, y=.42.
    const tx = w * 0.68;
    const ty = h * 0.42;
    const relay = this.add.container(tx, ty).setDepth(12);

    const base = this.add.graphics();
    base.fillStyle(0x10272e, 0.98);
    base.fillRoundedRect(-72, 28, 144, 52, 10);
    base.lineStyle(2, 0x7cb4b9, 0.5);
    base.strokeRoundedRect(-72, 28, 144, 52, 10);
    base.fillStyle(0x315761, 1);
    base.fillTriangle(-58, 28, -29, -58, -6, 28);
    base.fillTriangle(58, 28, 29, -58, 6, 28);

    const mast = this.add.rectangle(0, -70, 15, 118, 0x17363d, 1).setStrokeStyle(2, 0x8dbec3, 0.42);
    const braceL = this.add.rectangle(-21, -26, 7, 90, 0x244b54, 1).setRotation(-0.24);
    const braceR = this.add.rectangle(21, -26, 7, 90, 0x244b54, 1).setRotation(0.24);
    const hub = this.add.circle(0, -113, 15, 0x0a2026, 1).setStrokeStyle(3, 0x9ed3d6, 0.62);

    const dish = this.add.container(0, -127);
    const dishBack = this.add.ellipse(0, 0, 112, 39, 0x17343b, 1).setStrokeStyle(3, 0xc0e5e6, 0.72);
    const dishFace = this.add.ellipse(1, -2, 82, 27, 0x5c8991, 0.76);
    const dishGlow = this.add.ellipse(3, -3, 56, 15, 0xa8e7e7, 0.13);
    const dishCore = this.add.circle(4, -4, 9, 0xf2c97a, 0.96);
    const receiverArm = this.add.rectangle(48, -8, 44, 5, 0x7aa6ad, 1).setRotation(-0.18);
    const receiver = this.add.circle(69, -15, 5, 0xeaffff, 0.9);
    dish.add([dishBack, dishFace, dishGlow, dishCore, receiverArm, receiver]);

    // Mechanical service housing, not a floating target marker.
    const housing = this.add.graphics();
    housing.fillStyle(0x091a1f, 1);
    housing.fillRoundedRect(-46, -24, 92, 50, 7);
    housing.lineStyle(2, 0x6f9fa6, 0.5);
    housing.strokeRoundedRect(-46, -24, 92, 50, 7);
    housing.lineStyle(2, 0x274f57, 0.9);
    housing.lineBetween(-31, -13, 31, -13);
    housing.lineBetween(-31, 15, 31, 15);

    // Exposed coupler = deterministic interaction point, physically embedded at the exact hit coordinate.
    // Its asymmetric keyed geometry deliberately avoids a bullseye/target-board silhouette.
    const couplerAssembly = this.add.container(0, 0);
    const couplerPlate = this.add.polygon(0, 0, [
      -16, -11, 8, -11, 17, -3, 12, 11, -11, 11, -18, 3
    ], 0x294a51, 1).setStrokeStyle(2, 0xa4d5d6, 0.72);
    const couplerKey = this.add.rectangle(1, 0, 13, 8, 0xd6ad59, 1).setRotation(-0.12);
    const couplerLatch = this.add.rectangle(13, -1, 7, 16, 0x6e969c, 1).setRotation(0.2);
    const couplerBoltA = this.add.circle(-11, -4, 2.5, 0xd2ecec, 0.9);
    const couplerBoltB = this.add.circle(-9, 6, 2.5, 0xd2ecec, 0.75);
    couplerAssembly.add([couplerPlate, couplerKey, couplerLatch, couplerBoltA, couplerBoltB]);

    const statusA = this.add.circle(-31, -16, 3.5, 0xf0d678, 0.72);
    const statusB = this.add.circle(-20, -16, 3.5, 0x9dd7d9, 0.42);
    const statusC = this.add.circle(-9, -16, 3.5, 0x9dd7d9, 0.42);
    const sidePanel = this.add.rectangle(39, 2, 14, 29, 0x24464e, 1).setStrokeStyle(1, 0x80b6bb, 0.6);

    relay.add([base, braceL, braceR, mast, hub, dish, housing, couplerAssembly, statusA, statusB, statusC, sidePanel]);
    activationObjects.push(statusA, statusB, statusC, dishCore, couplerKey, couplerLatch);

    // Cables physically connect the coupler installation to the valley systems.
    const power = this.add.graphics().setDepth(7);
    power.lineStyle(4, 0x1b4a53, 0.82);
    power.beginPath();
    power.moveTo(tx, ty + 72);
    power.lineTo(594, 355);
    power.lineTo(486, 385);
    power.lineTo(380, 366);
    power.strokePath();
    power.lineStyle(1, 0x92d6d9, 0.5);
    power.beginPath();
    power.moveTo(tx, ty + 72);
    power.lineTo(594, 355);
    power.lineTo(486, 385);
    power.lineTo(380, 366);
    power.strokePath();

    // Foreground crystalline framing and drifting snow.
    const fg = this.add.graphics().setDepth(18);
    fg.fillStyle(0x18353f, 0.82);
    fg.fillTriangle(0, 540, 98, 458, 184, 540);
    fg.fillTriangle(960, 540, 862, 455, 774, 540);
    fg.fillStyle(0xbbe5e7, 0.14);
    fg.fillTriangle(32, 540, 106, 475, 146, 540);
    fg.fillTriangle(928, 540, 858, 474, 818, 540);

    if (!reducedMotion()) {
      this.tweens.add({ targets: dish, angle: { from: -3.5, to: 3.5 }, duration: 3800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: bg, x: w * 0.5 + 7, duration: 10500, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: hazeA, x: hazeA.x + 42, alpha: { from: 0.045, to: 0.10 }, duration: 7800, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: hazeB, x: hazeB.x - 48, alpha: { from: 0.04, to: 0.08 }, duration: 9300, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: dawn, alpha: { from: 0.06, to: 0.12 }, duration: 5200, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: rudraa, y: rudraa.y - 3, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: heroShadow, scaleX: { from: 1, to: 0.95 }, alpha: { from: 0.38, to: 0.31 }, duration: 2400, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
      this.tweens.add({ targets: couplerKey, alpha: { from: 0.72, to: 1 }, duration: 840, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    }

    for (let i = 0; i < 42; i += 1) {
      const flake = this.add.circle(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(-40, h),
        Phaser.Math.Between(1, 3),
        0xeaf9fa,
        Phaser.Math.FloatBetween(0.16, 0.54)
      ).setDepth(17);
      if (!reducedMotion()) {
        this.tweens.add({
          targets: flake,
          x: flake.x + Phaser.Math.Between(28, 86),
          y: h + 24,
          alpha: 0.04,
          duration: Phaser.Math.Between(6500, 11000),
          repeat: -1,
          onRepeat: () => {
            flake.x = Phaser.Math.Between(-50, w);
            flake.y = Phaser.Math.Between(-100, 0);
            flake.alpha = Phaser.Math.FloatBetween(0.16, 0.54);
          }
        });
      }
    }

    if (!reducedMotion()) {
      this.cameras.main.setZoom(1.016);
      this.tweens.add({ targets: this.cameras.main, zoom: 1, duration: 1200, ease: 'Sine.out' });
    }

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (activeScene === this) activeScene = null;
    });
  }
}

export function mountGlacierReferenceScene(parent) {
  destroyPhaserReferenceScene();
  if (!parent || !window.Phaser) return false;

  game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: DESIGN_WIDTH,
    height: DESIGN_HEIGHT,
    backgroundColor: '#8eb8c0',
    transparent: false,
    antialias: true,
    render: {
      antialias: true,
      pixelArt: false,
      roundPixels: false,
      powerPreference: 'low-power'
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: DESIGN_WIDTH,
      height: DESIGN_HEIGHT
    },
    audio: { noAudio: true },
    scene: [GlacierReferenceScene]
  });

  if (typeof ResizeObserver === 'function') {
    resizeObserver = new ResizeObserver(() => {
      if (game?.scale) game.scale.refresh();
    });
    resizeObserver.observe(parent);
  } else {
    window.addEventListener('resize', refreshPhaserScale, { passive: true });
  }
  return true;
}

export function activateGlacierReferenceScene() {
  if (!activeScene || activationObjects.length === 0) return;

  for (const object of activationObjects) {
    object.setAlpha(1);
    if (!reducedMotion()) {
      activeScene.tweens.add({
        targets: object,
        alpha: { from: 0.24, to: 1 },
        scale: { from: 0.76, to: 1.22 },
        duration: 320,
        yoyo: true,
        ease: 'Sine.out'
      });
    }
  }

  const beam = activeScene.add.graphics().setDepth(11);
  beam.lineStyle(5, 0xcdfcff, 0.70);
  beam.lineBetween(278, 545, 545, 484);
  beam.lineBetween(545, 484, 846, 524);
  beam.lineBetween(846, 524, 1134, 456);
  beam.lineBetween(1134, 456, DESIGN_WIDTH * 0.68, DESIGN_HEIGHT * 0.42 - 113);

  const successWash = activeScene.add.rectangle(DESIGN_WIDTH * 0.5, DESIGN_HEIGHT * 0.5, DESIGN_WIDTH, DESIGN_HEIGHT, 0xa7f2ed, 0.12).setDepth(10);
  if (!reducedMotion()) {
    activeScene.tweens.add({ targets: beam, alpha: 0, duration: 1100, delay: 500, onComplete: () => beam.destroy() });
    activeScene.tweens.add({ targets: successWash, alpha: 0, duration: 760, delay: 260, onComplete: () => successWash.destroy() });
  } else {
    window.setTimeout(() => { beam.destroy(); successWash.destroy(); }, 220);
  }
}

function refreshPhaserScale() {
  if (game?.scale) game.scale.refresh();
}

export function destroyPhaserReferenceScene() {
  window.removeEventListener('resize', refreshPhaserScale);
  resizeObserver?.disconnect();
  resizeObserver = null;
  activationObjects = [];
  activeScene = null;
  if (game) {
    game.destroy(true);
    game = null;
  }
}
