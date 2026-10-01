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
    this.load.svg('glacier-world', '/assets/worlds/glacier-reach.svg', { width: 1600, height: 900 });
  }

  create() {
    activeScene = this;
    activationObjects = [];

    const w = DESIGN_WIDTH;
    const h = DESIGN_HEIGHT;
    const bg = this.add.image(w * 0.5, h * 0.5, 'glacier-world').setOrigin(0.5).setDepth(0);
    cover(bg, w, h);

    const skyWash = this.add.rectangle(w * 0.5, h * 0.5, w, h, 0xb9d6df, 0.09).setDepth(1);

    // Deep glacier silhouettes establish foreground / midground separation.
    const mid = this.add.graphics().setDepth(2);
    mid.fillStyle(0x18343e, 0.36);
    mid.fillTriangle(0, 430, 175, 245, 350, 430);
    mid.fillTriangle(230, 430, 500, 205, 720, 430);
    mid.fillTriangle(575, 430, 820, 235, 960, 430);

    const cliff = this.add.graphics().setDepth(5);
    cliff.fillStyle(0x142a31, 0.94);
    cliff.beginPath();
    cliff.moveTo(560, 350);
    cliff.lineTo(960, 300);
    cliff.lineTo(960, 540);
    cliff.lineTo(510, 540);
    cliff.lineTo(545, 438);
    cliff.closePath();
    cliff.fillPath();
    cliff.fillStyle(0x6f939d, 0.28);
    cliff.fillTriangle(580, 352, 690, 328, 620, 425);

    // Distant signal infrastructure, embedded into the world rather than floating targets.
    const infrastructure = this.add.graphics().setDepth(4);
    infrastructure.lineStyle(4, 0x29454a, 0.9);
    infrastructure.lineBetween(92, 302, 300, 278);
    infrastructure.lineBetween(300, 278, 500, 292);
    infrastructure.lineBetween(500, 292, 665, 250);
    infrastructure.lineStyle(2, 0xa9d7dc, 0.42);
    infrastructure.lineBetween(92, 302, 665, 250);

    const beaconXs = [110, 305, 505];
    beaconXs.forEach((x, index) => {
      const baseY = index === 1 ? 276 : 300;
      const mast = this.add.rectangle(x, baseY, 10, 72, 0x10272c, 1).setDepth(6);
      const cap = this.add.circle(x, baseY - 39, 9, 0x8fd5dc, 0.18).setDepth(7);
      const core = this.add.circle(x, baseY - 39, 4, 0xd9fbff, 0.22).setDepth(8);
      activationObjects.push(cap, core);
      mast.setStrokeStyle(1, 0x7eb6bd, 0.32);
    });

    // Authored relay installation at the deterministic mission target coordinate (0.68, 0.42).
    const tx = w * 0.68;
    const ty = h * 0.42;
    const relay = this.add.container(tx, ty).setDepth(12);

    const pedestal = this.add.graphics();
    pedestal.fillStyle(0x12262a, 1);
    pedestal.fillRoundedRect(-56, 35, 112, 38, 8);
    pedestal.lineStyle(2, 0x7da5aa, 0.45);
    pedestal.strokeRoundedRect(-56, 35, 112, 38, 8);
    pedestal.fillStyle(0x38545a, 1);
    pedestal.fillTriangle(-42, 35, -18, -40, 0, 35);
    pedestal.fillTriangle(42, 35, 18, -40, 0, 35);

    const mast = this.add.rectangle(0, -56, 13, 105, 0x193339, 1).setStrokeStyle(2, 0x86b7bd, 0.38);
    const hub = this.add.circle(0, -92, 13, 0x0c2025, 1).setStrokeStyle(3, 0x9bc7cc, 0.6);

    const dish = this.add.container(0, -103);
    const dishBack = this.add.ellipse(0, -2, 92, 34, 0x1a343a, 1).setStrokeStyle(3, 0xb2d4d8, 0.68);
    const dishFace = this.add.ellipse(2, -4, 68, 23, 0x658c94, 0.64);
    const dishCore = this.add.circle(2, -4, 8, 0xf1d379, 0.92);
    const receiverArm = this.add.rectangle(39, -7, 34, 5, 0x6f969d, 1).setRotation(-0.18);
    const receiver = this.add.circle(55, -12, 4, 0xe7f8fa, 0.86);
    dish.add([dishBack, dishFace, dishCore, receiverArm, receiver]);

    const servicePanel = this.add.rectangle(0, 4, 53, 42, 0x0a171b, 1).setStrokeStyle(2, 0x7da5aa, 0.45);
    const statusA = this.add.circle(-14, 4, 4, 0xf0d678, 0.72);
    const statusB = this.add.circle(0, 4, 4, 0x9dd7d9, 0.42);
    const statusC = this.add.circle(14, 4, 4, 0x9dd7d9, 0.42);

    relay.add([pedestal, mast, hub, dish, servicePanel, statusA, statusB, statusC]);
    activationObjects.push(statusA, statusB, statusC, dishCore);

    // Cable and buried power path visually connect the small objective to the larger valley system.
    const power = this.add.graphics().setDepth(7);
    power.lineStyle(3, 0x8ccbd0, 0.3);
    power.beginPath();
    power.moveTo(tx - 8, ty + 70);
    power.lineTo(540, 355);
    power.lineTo(415, 385);
    power.lineTo(270, 372);
    power.strokePath();

    // Foreground snow bank frames the scope and keeps the installation grounded.
    const snow = this.add.graphics().setDepth(20);
    snow.fillStyle(0xc8dde0, 0.38);
    snow.fillEllipse(230, 515, 520, 92);
    snow.fillStyle(0x799da5, 0.28);
    snow.fillEllipse(760, 532, 610, 105);

    // Atmospheric motion is subtle and cheap.
    if (!reducedMotion()) {
      this.tweens.add({
        targets: dish,
        angle: { from: -3.2, to: 3.2 },
        duration: 3600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
      this.tweens.add({
        targets: bg,
        x: w * 0.5 + 8,
        duration: 9000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.inOut'
      });
    }

    for (let i = 0; i < 34; i += 1) {
      const flake = this.add.circle(
        Phaser.Math.Between(0, w),
        Phaser.Math.Between(0, h),
        Phaser.Math.Between(1, 3),
        0xe8f5f7,
        Phaser.Math.FloatBetween(0.15, 0.5)
      ).setDepth(18);
      if (!reducedMotion()) {
        this.tweens.add({
          targets: flake,
          x: flake.x + Phaser.Math.Between(35, 90),
          y: h + 20,
          alpha: 0.05,
          duration: Phaser.Math.Between(6500, 11000),
          repeat: -1,
          onRepeat: () => {
            flake.x = Phaser.Math.Between(-40, w);
            flake.y = Phaser.Math.Between(-80, 20);
            flake.alpha = Phaser.Math.FloatBetween(0.15, 0.5);
          }
        });
      }
    }

    // Slight camera settle creates the wide-landscape reveal without changing gameplay coordinates.
    if (!reducedMotion()) {
      this.cameras.main.setZoom(1.018);
      this.tweens.add({
        targets: this.cameras.main,
        zoom: 1,
        duration: 1100,
        ease: 'Sine.out'
      });
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
    backgroundColor: '#b4cfd5',
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
        alpha: { from: 0.28, to: 1 },
        scale: { from: 0.72, to: 1.18 },
        duration: 260,
        yoyo: true,
        ease: 'Sine.out'
      });
    }
  }

  const beam = activeScene.add.graphics().setDepth(10);
  beam.lineStyle(4, 0xcdf9ff, 0.65);
  beam.lineBetween(110, 261, 305, 237);
  beam.lineBetween(305, 237, 505, 261);
  beam.lineBetween(505, 261, DESIGN_WIDTH * 0.68, DESIGN_HEIGHT * 0.42 - 92);

  if (!reducedMotion()) {
    activeScene.tweens.add({
      targets: beam,
      alpha: 0,
      duration: 900,
      delay: 550,
      onComplete: () => beam.destroy()
    });
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
