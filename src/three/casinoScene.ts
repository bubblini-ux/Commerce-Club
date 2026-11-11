/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  createBlackjackFeltTexture,
  createCommerceCarpetTexture,
  createCSSkinCanvasTexture,
  createNeonSignTexture,
  createPolishedMarbleTexture,
  createRouletteFeltTexture,
  createRouletteWheelTexture,
} from './proceduralTextures';

// Pre-allocated reusable math scratchpads outside render loop (Zero GC in tick)
export const _vec3 = new THREE.Vector3();
export const _quat = new THREE.Quaternion();
export const _mat4 = new THREE.Matrix4();

export interface TableTargets {
  floor: { position: THREE.Vector3; lookAt: THREE.Vector3 };
  blackjack: { position: THREE.Vector3; lookAt: THREE.Vector3 };
  roulette: { position: THREE.Vector3; lookAt: THREE.Vector3 };
  cs_cases: { position: THREE.Vector3; lookAt: THREE.Vector3 };
  slots: { position: THREE.Vector3; lookAt: THREE.Vector3 };
}

export interface CasinoSceneContext {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  isSoftwareGl: boolean;
  tableTargets: TableTargets;
  rouletteWheelMesh: THREE.Mesh | null;
  rouletteBallMesh: THREE.Mesh | null;
  csPreviewGroup: THREE.Group | null;
  csKnifeBladeMesh: THREE.Mesh | null;
  slotReels: THREE.Group[];
  interactiveMeshes: { mesh: THREE.Object3D; tableName: keyof TableTargets }[];
  updateSkinPreview: (patternType: string, primary: string, secondary: string) => void;
  dispose: () => void;
}

export function initCasinoScene(container: HTMLDivElement): CasinoSceneContext {
  // Software WebGL Detection (Three.js r160+ standard)
  const isSoftwareGl = (() => {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  })();

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: 'high-performance',
    alpha: false,
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.shadowMap.enabled = !isSoftwareGl;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0a0c14');
  scene.fog = new THREE.FogExp2('#0a0c14', 0.028);

  // Mandatory Studio Environment Reflection (RoomEnvironment + PMREMGenerator)
  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const roomEnv = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environment = roomEnv;
  pmremGenerator.dispose();

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 3.2, 9.5);
  camera.lookAt(0, 1.8, 0);

  // Studio Lighting Rig (Warm Key Light + Cool Hemisphere Light + Glowing Neon Points)
  const hemiLight = new THREE.HemisphereLight('#fce7f3', '#1e1b4b', 0.85);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight('#fff1e6', 2.2);
  keyLight.position.set(6, 12, 8);
  if (!isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 30;
    const d = 14;
    keyLight.shadow.camera.left = -d;
    keyLight.shadow.camera.right = d;
    keyLight.shadow.camera.top = d;
    keyLight.shadow.camera.bottom = -d;
    keyLight.shadow.bias = -0.0004;
    keyLight.shadow.normalBias = 0.02;
  }
  scene.add(keyLight);

  // Fill Light
  const fillLight = new THREE.DirectionalLight('#38bdf8', 0.9);
  fillLight.position.set(-8, 9, -5);
  scene.add(fillLight);

  // GTA 6 / Vice Neon Accent Lights (Magenta & Cyan & Warm Amber)
  const neonPink = new THREE.PointLight('#f43f5e', 2.2, 18, 1.5);
  neonPink.position.set(-6, 4.5, -2);
  scene.add(neonPink);

  const neonCyan = new THREE.PointLight('#06b6d4', 2.2, 18, 1.5);
  neonCyan.position.set(6, 4.5, -2);
  scene.add(neonCyan);

  const neonGold = new THREE.PointLight('#eab308', 2.8, 20, 1.2);
  neonGold.position.set(0, 5.0, 2);
  scene.add(neonGold);

  // Shared Procedural Textures & Materials
  const carpetTex = createCommerceCarpetTexture();
  const marbleTex = createPolishedMarbleTexture();
  carpetTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  marbleTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const carpetMat = new THREE.MeshStandardMaterial({
    map: carpetTex,
    roughness: 0.85,
    metalness: 0.05,
  });

  const marbleMat = new THREE.MeshStandardMaterial({
    map: marbleTex,
    roughness: 0.2,
    metalness: 0.15,
  });

  const goldBrassMat = new THREE.MeshStandardMaterial({
    color: '#d4af37',
    metalness: 0.9,
    roughness: 0.22,
  });

  const polishedWoodMat = new THREE.MeshStandardMaterial({
    color: '#2a1106',
    metalness: 0.1,
    roughness: 0.35,
  });

  const darkLeatherMat = new THREE.MeshStandardMaterial({
    color: '#1a1816',
    roughness: 0.7,
    metalness: 0.08,
  });

  const wallMat = new THREE.MeshStandardMaterial({
    color: '#1e2230',
    roughness: 0.75,
    metalness: 0.1,
  });

  // Soft Radial Contact Shadow helper (prevents floating look)
  function createContactShadow(radius: number, opacity: number = 0.5): THREE.Mesh {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, `rgba(0, 0, 0, ${opacity})`);
    grad.addColorStop(0.6, `rgba(0, 0, 0, ${opacity * 0.4})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);

    const shadowTex = new THREE.CanvasTexture(canvas);
    const geo = new THREE.PlaneGeometry(radius * 2, radius * 2);
    const mat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const shadow = new THREE.Mesh(geo, mat);
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.y = 0.01;
    return shadow;
  }

  // 1. FLOOR SETUP (Carpet center + Polished marble perimeter with brass dividers)
  const floorGroup = new THREE.Group();

  // Central gaming carpet
  const carpetGeo = new THREE.PlaneGeometry(28, 24);
  const carpetMesh = new THREE.Mesh(carpetGeo, carpetMat);
  carpetMesh.rotation.x = -Math.PI / 2;
  carpetMesh.position.set(0, 0.005, 0);
  carpetMesh.receiveShadow = !isSoftwareGl;
  floorGroup.add(carpetMesh);

  // Surrounding marble border
  const borderGeo = new THREE.PlaneGeometry(36, 32);
  const borderMesh = new THREE.Mesh(borderGeo, marbleMat);
  borderMesh.rotation.x = -Math.PI / 2;
  borderMesh.position.set(0, 0, 0);
  borderMesh.receiveShadow = !isSoftwareGl;
  floorGroup.add(borderMesh);

  // Brass trim strip separating carpet and marble
  const trimGeo = new THREE.RingGeometry(13.8, 14.1, 4, 1, 0, Math.PI * 2);
  const trimMesh = new THREE.Mesh(trimGeo, goldBrassMat);
  trimMesh.rotation.x = -Math.PI / 2;
  trimMesh.position.set(0, 0.012, 0);
  trimMesh.scale.set(1.05, 0.9, 1);
  floorGroup.add(trimMesh);

  scene.add(floorGroup);

  // 2. CASINO WALLS & CEILING COVE
  const wallGroup = new THREE.Group();

  // Back Wall with Luxury Wood Wainscoting and Neon Commerce Sign
  const backWallGeo = new THREE.BoxGeometry(36, 9, 0.6);
  const backWall = new THREE.Mesh(backWallGeo, wallMat);
  backWall.position.set(0, 4.5, -16);
  backWall.receiveShadow = !isSoftwareGl;
  wallGroup.add(backWall);

  // Walnut Wainscoting Lower Half
  const wainscotGeo = new THREE.BoxGeometry(36, 3.2, 0.7);
  const wainscot = new THREE.Mesh(wainscotGeo, polishedWoodMat);
  wainscot.position.set(0, 1.6, -15.9);
  wallGroup.add(wainscot);

  // Gold Trim Rail on Wainscot
  const railGeo = new THREE.BoxGeometry(36, 0.12, 0.8);
  const rail = new THREE.Mesh(railGeo, goldBrassMat);
  rail.position.set(0, 3.25, -15.85);
  wallGroup.add(rail);

  // Side Walls
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 9, 32), wallMat);
  leftWall.position.set(-18, 4.5, 0);
  wallGroup.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.6, 9, 32), wallMat);
  rightWall.position.set(18, 4.5, 0);
  wallGroup.add(rightWall);

  // Ceiling with Coffered Gold Cove Lighting
  const ceilingGeo = new THREE.BoxGeometry(36, 0.4, 32);
  const ceiling = new THREE.Mesh(ceilingGeo, new THREE.MeshStandardMaterial({ color: '#13151c', roughness: 0.9 }));
  ceiling.position.set(0, 9, 0);
  wallGroup.add(ceiling);

  scene.add(wallGroup);

  // 3. ICONIC COMMERCE CASINO NEON MARQUEE SIGN (GTA 6 Vice Style)
  const neonSignTex = createNeonSignTexture(
    'THE COMMERCE CLUB',
    'CALIFORNIA HIGH ROLLER CARDROOM · EST. COMMERCE CA',
    '#ec4899',
    '#f59e0b'
  );
  neonSignTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(16, 4),
    new THREE.MeshStandardMaterial({
      map: neonSignTex,
      emissive: '#ec4899',
      emissiveMap: neonSignTex,
      emissiveIntensity: 0.65,
      roughness: 0.25,
      metalness: 0.3,
    })
  );
  signMesh.position.set(0, 6.2, -15.65);
  scene.add(signMesh);

  // Brass sign mounting frame
  const signFrame = new THREE.Mesh(new THREE.BoxGeometry(16.4, 4.3, 0.15), goldBrassMat);
  signFrame.position.set(0, 6.2, -15.75);
  scene.add(signFrame);

  // Secondary Neon Banners for Games
  const csNeonTex = createNeonSignTexture('CS:GO VAULT', 'CASE UNBOXING & KNIFE SHOWCASE', '#06b6d4', '#ffd700');
  const csSign = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 1.8),
    new THREE.MeshStandardMaterial({
      map: csNeonTex,
      emissive: '#06b6d4',
      emissiveMap: csNeonTex,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    })
  );
  csSign.position.set(9.5, 4.8, -15.65);
  scene.add(csSign);

  const vipBlackjackTex = createNeonSignTexture('VIP HIGH ROLLER', 'NO LIMIT BLACKJACK', '#10b981', '#f59e0b');
  const bjSign = new THREE.Mesh(
    new THREE.PlaneGeometry(6, 1.8),
    new THREE.MeshStandardMaterial({
      map: vipBlackjackTex,
      emissive: '#10b981',
      emissiveMap: vipBlackjackTex,
      emissiveIntensity: 0.7,
      roughness: 0.3,
    })
  );
  bjSign.position.set(-9.5, 4.8, -15.65);
  scene.add(bjSign);

  // 4. ARCHITECTURAL ELEMENTS: Fluted Marble Columns & Crystal Chandeliers
  function createFlutedColumn(x: number, z: number): THREE.Group {
    const colGroup = new THREE.Group();
    colGroup.position.set(x, 0, z);

    // Base pedestal
    const baseGeo = new THREE.BoxGeometry(1.4, 0.4, 1.4);
    const base = new THREE.Mesh(baseGeo, marbleMat);
    base.position.y = 0.2;
    colGroup.add(base);

    // Brass plinth ring
    const ringGeo = new THREE.CylinderGeometry(0.65, 0.7, 0.2, 24);
    const ring = new THREE.Mesh(ringGeo, goldBrassMat);
    ring.position.y = 0.5;
    colGroup.add(ring);

    // Fluted shaft (Lathe or Cylinder with vertical ribs)
    const shaftGeo = new THREE.CylinderGeometry(0.55, 0.55, 7.8, 28);
    const shaft = new THREE.Mesh(shaftGeo, marbleMat);
    shaft.position.y = 4.4;
    if (!isSoftwareGl) shaft.castShadow = true;
    shaft.receiveShadow = !isSoftwareGl;
    colGroup.add(shaft);

    // Brass Capital on top
    const capGeo = new THREE.BoxGeometry(1.3, 0.4, 1.3);
    const cap = new THREE.Mesh(capGeo, goldBrassMat);
    cap.position.y = 8.4;
    colGroup.add(cap);

    colGroup.add(createContactShadow(1.2, 0.6));
    return colGroup;
  }

  // Place columns along walkway
  scene.add(createFlutedColumn(-13, -7));
  scene.add(createFlutedColumn(-13, 7));
  scene.add(createFlutedColumn(13, -7));
  scene.add(createFlutedColumn(13, 7));

  // Grand Tiered Crystal Chandeliers
  function createChandelier(x: number, y: number, z: number): THREE.Group {
    const chGroup = new THREE.Group();
    chGroup.position.set(x, y, z);

    // Hanging brass chain
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), goldBrassMat);
    chain.position.y = 1.1;
    chGroup.add(chain);

    // Tier 1 Brass Ring
    const t1Ring = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.07, 12, 32), goldBrassMat);
    t1Ring.rotation.x = Math.PI / 2;
    chGroup.add(t1Ring);

    // Tier 2 Brass Ring
    const t2Ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.06, 12, 24), goldBrassMat);
    t2Ring.rotation.x = Math.PI / 2;
    t2Ring.position.y = -0.4;
    chGroup.add(t2Ring);

    // Crystal Prisms (Glass material)
    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: '#ffffff',
      metalness: 0.1,
      roughness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.85,
      transparent: true,
      opacity: isSoftwareGl ? 0.6 : 1.0,
      ior: 1.55,
    });

    const prismCount = 18;
    for (let i = 0; i < prismCount; i++) {
      const angle = (i / prismCount) * Math.PI * 2;
      const px = Math.cos(angle) * 1.6;
      const pz = Math.sin(angle) * 1.6;
      const prism = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.6, 5), crystalMat);
      prism.position.set(px, -0.3, pz);
      prism.rotation.x = Math.PI;
      chGroup.add(prism);
    }

    // Warm chandelier light
    const chLight = new THREE.PointLight('#fed7aa', 1.8, 12, 1.6);
    chLight.position.set(0, -0.3, 0);
    chGroup.add(chLight);

    return chGroup;
  }

  scene.add(createChandelier(-6, 7.2, -4));
  scene.add(createChandelier(6, 7.2, -4));
  scene.add(createChandelier(0, 7.5, 3));

  // California Date Palms in Brass Planters (Authentic Commerce California feel)
  function createCaliforniaPalm(x: number, z: number): THREE.Group {
    const palmGroup = new THREE.Group();
    palmGroup.position.set(x, 0, z);

    // Brass Planter
    const planterGeo = new THREE.CylinderGeometry(0.65, 0.5, 0.8, 20);
    const planter = new THREE.Mesh(planterGeo, goldBrassMat);
    planter.position.y = 0.4;
    planter.castShadow = !isSoftwareGl;
    palmGroup.add(planter);

    // Soil
    const soil = new THREE.Mesh(new THREE.CircleGeometry(0.6, 16), new THREE.MeshStandardMaterial({ color: '#241a14', roughness: 0.95 }));
    soil.rotation.x = -Math.PI / 2;
    soil.position.y = 0.81;
    palmGroup.add(soil);

    // Segmented curved trunk
    const trunkGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#57422f', roughness: 0.85, metalness: 0.1 });
    let currY = 0.8;
    for (let i = 0; i < 7; i++) {
      const r = 0.18 - i * 0.012;
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r, 0.4, 12), trunkMat);
      seg.position.set(Math.sin(i * 0.15) * 0.1, currY + 0.2, 0);
      seg.rotation.z = -i * 0.03;
      seg.castShadow = !isSoftwareGl;
      trunkGroup.add(seg);
      currY += 0.38;
    }
    palmGroup.add(trunkGroup);

    // Fronds (Arching leaves)
    const frondMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.6, side: THREE.DoubleSide });
    const frondCount = 9;
    for (let i = 0; i < frondCount; i++) {
      const angle = (i / frondCount) * Math.PI * 2;
      const frondGeo = new THREE.CylinderGeometry(0.02, 0.2, 1.8, 6);
      const frond = new THREE.Mesh(frondGeo, frondMat);
      frond.position.set(Math.cos(angle) * 0.7, currY + 0.1, Math.sin(angle) * 0.7);
      frond.rotation.y = angle;
      frond.rotation.z = Math.PI / 3;
      palmGroup.add(frond);
    }

    palmGroup.add(createContactShadow(1.1, 0.5));
    return palmGroup;
  }

  scene.add(createCaliforniaPalm(-15, -12));
  scene.add(createCaliforniaPalm(-15, 12));
  scene.add(createCaliforniaPalm(15, -12));
  scene.add(createCaliforniaPalm(15, 12));

  // Interactive targets registry
  const interactiveMeshes: { mesh: THREE.Object3D; tableName: keyof TableTargets }[] = [];

  // 5. TABLE 1: HIGH-STAKES BLACKJACK TABLE
  function createBlackjackTable(): THREE.Group {
    const table = new THREE.Group();
    table.position.set(-6.5, 0, -3.5);

    // Wooden Pedestal Base (2 heavy fluted pillared legs)
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.45, 1.2, 16), polishedWoodMat);
    leg1.position.set(-1.8, 0.6, 0);
    leg1.castShadow = !isSoftwareGl;
    table.add(leg1);

    const leg2 = leg1.clone();
    leg2.position.set(1.8, 0.6, 0);
    table.add(leg2);

    // Brass Stretcher Bar
    const stretcher = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 3.8, 12), goldBrassMat);
    stretcher.rotation.z = Math.PI / 2;
    stretcher.position.set(0, 0.35, 0);
    table.add(stretcher);

    // Table Felt Surface (Semi-circular card table)
    const bjFeltTex = createBlackjackFeltTexture();
    bjFeltTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const feltMat = new THREE.MeshStandardMaterial({
      map: bjFeltTex,
      roughness: 0.85,
      metalness: 0.05,
    });

    const feltMesh = new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.1, 32, 1, false, 0, Math.PI), feltMat);
    feltMesh.rotation.y = -Math.PI / 2;
    feltMesh.position.set(0, 1.25, 0);
    feltMesh.receiveShadow = !isSoftwareGl;
    feltMesh.castShadow = !isSoftwareGl;
    table.add(feltMesh);

    // Padded Black Leather Armrest (Tubular semi-circle)
    const armrestCurve = new THREE.EllipseCurve(0, 0, 2.82, 2.82, 0, Math.PI, false, 0);
    const points = armrestCurve.getPoints(32);
    const armrestGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(p.x, 0, p.y))), 32, 0.18, 12, false);
    const armrestMesh = new THREE.Mesh(armrestGeo, darkLeatherMat);
    armrestMesh.rotation.y = -Math.PI / 2;
    armrestMesh.position.set(0, 1.3, 0);
    table.add(armrestMesh);

    // Acrylic Card Dealing Shoe (Clear acrylic with black cards inside)
    const shoeMat = new THREE.MeshPhysicalMaterial({
      color: '#334155',
      transmission: isSoftwareGl ? 0 : 0.8,
      transparent: true,
      opacity: isSoftwareGl ? 0.7 : 0.9,
      roughness: 0.1,
    });
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.22, 0.6), shoeMat);
    shoe.position.set(1.4, 1.4, 0.2);
    shoe.rotation.y = -Math.PI / 6;
    table.add(shoe);

    // Dealer Chip Tray (Rows of colorful high-roller casino chips)
    const chipTray = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.12, 0.5), goldBrassMat);
    chipTray.position.set(0, 1.35, 0.2);
    table.add(chipTray);

    // Contact Shadow
    table.add(createContactShadow(3.2, 0.55));

    // Interaction clickable trigger mesh (invisible hit box)
    const hitGeo = new THREE.CylinderGeometry(3.2, 3.2, 2.0, 16);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });
    const hitBox = new THREE.Mesh(hitGeo, hitMat);
    hitBox.position.set(0, 1.0, 0);
    table.add(hitBox);

    interactiveMeshes.push({ mesh: hitBox, tableName: 'blackjack' });
    return table;
  }

  const blackjackTable = createBlackjackTable();
  scene.add(blackjackTable);

  // 6. TABLE 2: HIGH-ROLLER ROULETTE TABLE
  let rouletteWheelMesh: THREE.Mesh | null = null;
  let rouletteBallMesh: THREE.Mesh | null = null;

  function createRouletteTable(): THREE.Group {
    const table = new THREE.Group();
    table.position.set(0, 0, -4.0);

    // Mahogany main table frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.18, 2.6), polishedWoodMat);
    frame.position.set(0, 1.25, 0);
    frame.castShadow = !isSoftwareGl;
    table.add(frame);

    // Brass foot rails & pedestal legs
    const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, 1.2, 16), polishedWoodMat);
    leg1.position.set(-1.8, 0.6, 0);
    table.add(leg1);
    const leg2 = leg1.clone();
    leg2.position.set(1.8, 0.6, 0);
    table.add(leg2);

    // Green Felt Betting Layout on Right Half
    const feltTex = createRouletteFeltTexture();
    feltTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const feltMat = new THREE.MeshStandardMaterial({
      map: feltTex,
      roughness: 0.85,
      metalness: 0.05,
    });
    const feltMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 2.2), feltMat);
    feltMesh.rotation.x = -Math.PI / 2;
    feltMesh.position.set(0.8, 1.35, 0);
    table.add(feltMesh);

    // Mahogany Wheel Basin Surround on Left
    const basinGeo = new THREE.CylinderGeometry(1.05, 0.95, 0.28, 32);
    const basin = new THREE.Mesh(basinGeo, polishedWoodMat);
    basin.position.set(-1.6, 1.38, 0);
    table.add(basin);

    // Brass outer track rim
    const rimGeo = new THREE.TorusGeometry(0.98, 0.06, 12, 32);
    const rim = new THREE.Mesh(rimGeo, goldBrassMat);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(-1.6, 1.5, 0);
    table.add(rim);

    // Spinning Roulette Wheel Disk (with European numbers)
    const wheelTex = createRouletteWheelTexture();
    wheelTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const wheelMat = new THREE.MeshStandardMaterial({
      map: wheelTex,
      roughness: 0.25,
      metalness: 0.35,
    });
    const wheelGeo = new THREE.CylinderGeometry(0.88, 0.88, 0.06, 36);
    rouletteWheelMesh = new THREE.Mesh(wheelGeo, wheelMat);
    rouletteWheelMesh.position.set(-1.6, 1.48, 0);
    table.add(rouletteWheelMesh);

    // Brass Center Turret & Spokes
    const turret = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.28, 16), goldBrassMat);
    turret.position.set(-1.6, 1.62, 0);
    table.add(turret);

    // Ivory Roulette Ball
    const ballGeo = new THREE.SphereGeometry(0.038, 16, 16);
    const ballMat = new THREE.MeshStandardMaterial({ color: '#fefefe', roughness: 0.15, metalness: 0.05 });
    rouletteBallMesh = new THREE.Mesh(ballGeo, ballMat);
    rouletteBallMesh.position.set(-1.6 + 0.78, 1.52, 0);
    table.add(rouletteBallMesh);

    table.add(createContactShadow(3.0, 0.6));

    // Interaction Hit Box
    const hitBox = new THREE.Mesh(new THREE.BoxGeometry(5.4, 2.0, 3.0), new THREE.MeshBasicMaterial({ visible: false }));
    hitBox.position.set(0, 1.2, 0);
    table.add(hitBox);
    interactiveMeshes.push({ mesh: hitBox, tableName: 'roulette' });

    return table;
  }

  const rouletteTable = createRouletteTable();
  scene.add(rouletteTable);

  // 7. STATION 3: COUNTER-STRIKE CASE UNBOXING & SKIN VAULT
  let csPreviewGroup: THREE.Group | null = null;
  let csKnifeBladeMesh: THREE.Mesh | null = null;

  function createCSCaseStation(): THREE.Group {
    const station = new THREE.Group();
    station.position.set(6.5, 0, -3.5);

    // Futuristic Hexagonal Kiosk Pedestal
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.8, 1.1, 6);
    const baseMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.35, metalness: 0.6 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.55;
    base.castShadow = !isSoftwareGl;
    station.add(base);

    // Glowing Cyan Neon Rings
    const neonGeo = new THREE.TorusGeometry(1.62, 0.04, 8, 32);
    const neonMat = new THREE.MeshBasicMaterial({ color: '#06b6d4' });
    const ring1 = new THREE.Mesh(neonGeo, neonMat);
    ring1.rotation.x = Math.PI / 2;
    ring1.position.y = 1.05;
    station.add(ring1);

    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.4, 0.03, 8, 32), new THREE.MeshBasicMaterial({ color: '#ec4899' }));
    ring2.rotation.x = Math.PI / 2;
    ring2.position.y = 0.15;
    station.add(ring2);

    // Holographic Glass Display Cylinder
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#06b6d4',
      roughness: 0.05,
      metalness: 0.1,
      transmission: isSoftwareGl ? 0 : 0.9,
      transparent: true,
      opacity: isSoftwareGl ? 0.35 : 0.8,
      ior: 1.5,
    });
    const displayGlass = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 1.3, 24, 1, true), glassMat);
    displayGlass.position.y = 1.8;
    station.add(displayGlass);

    // Top Hologram Emitter Cap
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.1, 0.15, 24), baseMat);
    cap.position.y = 2.5;
    station.add(cap);

    // Floating 3D CS Knife / Weapon Model Group
    csPreviewGroup = new THREE.Group();
    csPreviewGroup.position.set(0, 1.8, 0);

    // Procedural Karambit Curved Blade
    const bladeCurve = new THREE.Shape();
    bladeCurve.moveTo(0, 0);
    bladeCurve.quadraticCurveTo(0.2, 0.4, 0.65, 0.7);
    bladeCurve.quadraticCurveTo(0.5, 0.3, 0.35, 0);
    bladeCurve.lineTo(0, 0);

    const extrudeSettings = {
      steps: 1,
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.015,
      bevelSegments: 3,
    };
    const bladeGeo = new THREE.ExtrudeGeometry(bladeCurve, extrudeSettings);
    bladeGeo.center();

    // Procedural CS Skin finish texture
    const initialSkinTex = createCSSkinCanvasTexture('marble_fade', '#f43f5e', '#3b82f6');
    const bladeMat = new THREE.MeshStandardMaterial({
      map: initialSkinTex,
      metalness: 0.85,
      roughness: 0.2,
    });
    csKnifeBladeMesh = new THREE.Mesh(bladeGeo, bladeMat);
    csKnifeBladeMesh.scale.set(1.4, 1.4, 1.4);
    csPreviewGroup.add(csKnifeBladeMesh);

    // Knife Handle with Finger Ring (Karambit handle)
    const handleMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.8, metalness: 0.2 });
    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.42, 0.08), handleMat);
    handle.position.set(-0.35, -0.22, 0);
    handle.rotation.z = Math.PI / 4;
    csPreviewGroup.add(handle);

    const ringMesh = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.03, 8, 16), handleMat);
    ringMesh.position.set(-0.52, -0.38, 0);
    csPreviewGroup.add(ringMesh);

    station.add(csPreviewGroup);

    // Spotlight pointing at holographic knife
    const spot = new THREE.PointLight('#06b6d4', 2.0, 5, 2);
    spot.position.set(0, 2.3, 0);
    station.add(spot);

    station.add(createContactShadow(2.2, 0.6));

    // Interaction Hit Box
    const hitBox = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.0, 2.6, 16), new THREE.MeshBasicMaterial({ visible: false }));
    hitBox.position.set(0, 1.3, 0);
    station.add(hitBox);
    interactiveMeshes.push({ mesh: hitBox, tableName: 'cs_cases' });

    return station;
  }

  const csStation = createCSCaseStation();
  scene.add(csStation);

  // 8. STATION 4: "CALIFORNIA GOLD" 5-REEL SLOTS BANK
  const slotReels: THREE.Group[] = [];

  function createSlotBank(): THREE.Group {
    const bank = new THREE.Group();
    bank.position.set(0, 0, 4.2);
    bank.rotation.y = Math.PI; // Facing back into room

    // Bank of 3 Luxury Slot Cabinets
    [-1.6, 0, 1.6].forEach((slotX, idx) => {
      const slot = new THREE.Group();
      slot.position.set(slotX, 0, 0);

      // Cabinet Base
      const cabinetGeo = new THREE.BoxGeometry(1.2, 2.4, 0.9);
      const cabinetMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.4, metalness: 0.5 });
      const cabinet = new THREE.Mesh(cabinetGeo, cabinetMat);
      cabinet.position.y = 1.2;
      cabinet.castShadow = !isSoftwareGl;
      slot.add(cabinet);

      // Gold Trim Edge
      const trim = new THREE.Mesh(new THREE.BoxGeometry(1.24, 2.42, 0.05), goldBrassMat);
      trim.position.set(0, 1.2, 0.46);
      slot.add(trim);

      // Marquee Topper Display with GTA Neon Glow
      const marqueeTex = createNeonSignTexture('777 GOLD', 'CALIFORNIA JACKPOT', '#f59e0b', '#ec4899');
      const marqueeMat = new THREE.MeshStandardMaterial({
        map: marqueeTex,
        emissive: '#f59e0b',
        emissiveMap: marqueeTex,
        emissiveIntensity: 0.8,
        roughness: 0.2,
      });
      const marquee = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.45, 0.1), marqueeMat);
      marquee.position.set(0, 2.2, 0.46);
      slot.add(marquee);

      // Reel Glass Window
      const windowMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 });
      const reelFrame = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.1), windowMat);
      reelFrame.position.set(0, 1.5, 0.46);
      slot.add(reelFrame);

      // Reels inside (Reel cylinders)
      const reelGroup = new THREE.Group();
      reelGroup.position.set(0, 1.5, 0.44);

      for (let r = 0; r < 5; r++) {
        const cyl = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.28, 0.16, 16),
          new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 })
        );
        cyl.rotation.z = Math.PI / 2;
        cyl.position.set(-0.36 + r * 0.18, 0, 0);
        reelGroup.add(cyl);
      }
      slot.add(reelGroup);
      if (idx === 1) slotReels.push(reelGroup);

      // Button Deck (Slanted control panel)
      const deck = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.15, 0.4), polishedWoodMat);
      deck.position.set(0, 1.05, 0.58);
      deck.rotation.x = Math.PI / 12;
      slot.add(deck);

      // Spin Button (Big Red Lamp)
      const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.04, 16), new THREE.MeshStandardMaterial({ color: '#ef4444', roughness: 0.2, emissive: '#ef4444', emissiveIntensity: 0.4 }));
      btn.position.set(0.35, 1.14, 0.58);
      slot.add(btn);

      // Mechanical Pull Lever on Right side
      const leverBase = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 12), goldBrassMat);
      leverBase.rotation.z = Math.PI / 2;
      leverBase.position.set(0.63, 1.25, 0.2);
      slot.add(leverBase);

      const leverStick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.55, 8), goldBrassMat);
      leverStick.position.set(0.66, 1.5, 0.2);
      leverStick.rotation.z = -Math.PI / 8;
      slot.add(leverStick);

      const leverKnob = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 16), new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.2 }));
      leverKnob.position.set(0.78, 1.72, 0.2);
      slot.add(leverKnob);

      bank.add(slot);
    });

    bank.add(createContactShadow(3.2, 0.5));

    // Interaction Hit Box
    const hitBox = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.5, 2.0), new THREE.MeshBasicMaterial({ visible: false }));
    hitBox.position.set(0, 1.2, 0);
    bank.add(hitBox);
    interactiveMeshes.push({ mesh: hitBox, tableName: 'slots' });

    return bank;
  }

  const slotBank = createSlotBank();
  scene.add(slotBank);

  // 9. VIP LOUNGE: Leather Chesterfield Sofas, Brass Coffee Table, Champagne Bucket
  function createVIPLounge(): THREE.Group {
    const lounge = new THREE.Group();
    lounge.position.set(-11.5, 0, 5.0);

    // Tufted Leather Chesterfield Sofa
    const sofa = new THREE.Group();
    const sofaSeat = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.45, 1.1), darkLeatherMat);
    sofaSeat.position.y = 0.35;
    sofa.add(sofaSeat);

    const sofaBack = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.7, 0.35), darkLeatherMat);
    sofaBack.position.set(0, 0.7, -0.45);
    sofa.add(sofaBack);

    const sofaArmL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.6, 1.1), darkLeatherMat);
    sofaArmL.position.set(-1.4, 0.6, 0);
    sofa.add(sofaArmL);

    const sofaArmR = sofaArmL.clone();
    sofaArmR.position.set(1.4, 0.6, 0);
    sofa.add(sofaArmR);

    lounge.add(sofa);

    // Coffee Table (Polished walnut with brass legs)
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.9), polishedWoodMat);
    tableTop.position.set(0, 0.45, 1.1);
    lounge.add(tableTop);

    const tLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.45, 8), goldBrassMat);
    tLeg.position.set(-0.8, 0.22, 0.8);
    lounge.add(tLeg);
    const tLeg2 = tLeg.clone();
    tLeg2.position.set(0.8, 0.22, 0.8);
    lounge.add(tLeg2);
    const tLeg3 = tLeg.clone();
    tLeg3.position.set(-0.8, 0.22, 1.4);
    lounge.add(tLeg3);
    const tLeg4 = tLeg.clone();
    tLeg4.position.set(0.8, 0.22, 1.4);
    lounge.add(tLeg4);

    // Silver Champagne Bucket with Ice & Gold Bottle
    const bucket = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.22, 16), goldBrassMat);
    bucket.position.set(0, 0.58, 1.1);
    lounge.add(bucket);

    const bottle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.28, 12), new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.1, metalness: 0.1 }));
    bottle.position.set(0, 0.68, 1.1);
    bottle.rotation.z = Math.PI / 10;
    lounge.add(bottle);

    lounge.add(createContactShadow(2.6, 0.45));
    return lounge;
  }

  scene.add(createVIPLounge());

  // Camera Target Anchors for Seamless Damped View Transitions
  const tableTargets: TableTargets = {
    floor: {
      position: new THREE.Vector3(0, 3.4, 9.8),
      lookAt: new THREE.Vector3(0, 1.8, -1.0),
    },
    blackjack: {
      position: new THREE.Vector3(-6.5, 2.4, -1.8),
      lookAt: new THREE.Vector3(-6.5, 1.25, -3.5),
    },
    roulette: {
      position: new THREE.Vector3(0.0, 2.7, -2.1),
      lookAt: new THREE.Vector3(0.0, 1.35, -4.0),
    },
    cs_cases: {
      position: new THREE.Vector3(6.5, 2.2, -1.7),
      lookAt: new THREE.Vector3(6.5, 1.8, -3.5),
    },
    slots: {
      position: new THREE.Vector3(0, 1.9, 2.4),
      lookAt: new THREE.Vector3(0, 1.5, 4.2),
    },
  };

  // Dynamic Skin Texture Update for 3D knife inspect
  function updateSkinPreview(patternType: string, primary: string, secondary: string) {
    if (csKnifeBladeMesh) {
      const tex = createCSSkinCanvasTexture(patternType, primary, secondary);
      tex.colorSpace = THREE.SRGBColorSpace;
      if (csKnifeBladeMesh.material instanceof THREE.MeshStandardMaterial) {
        csKnifeBladeMesh.material.map = tex;
        csKnifeBladeMesh.material.needsUpdate = true;
      }
    }
  }

  // Pre-warm shaders
  if (!isSoftwareGl) {
    renderer.compile(scene, camera);
  }

  return {
    renderer,
    scene,
    camera,
    isSoftwareGl,
    tableTargets,
    rouletteWheelMesh,
    rouletteBallMesh,
    csPreviewGroup,
    csKnifeBladeMesh,
    slotReels,
    interactiveMeshes,
    updateSkinPreview,
    dispose: () => {
      renderer.dispose();
      carpetTex.dispose();
      marbleTex.dispose();
      scene.clear();
    },
  };
}
