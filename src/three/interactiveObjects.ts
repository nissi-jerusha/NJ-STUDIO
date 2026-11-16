import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import type { ProceduralObjectType } from '../data/catalogue';

/**
 * Builds rich multi-part procedural 3D interactive objects (5–10 parts per model)
 * with calibrated PBR materials and grounded pivots.
 * Also supports loading external .glb / .gltf models seamlessly when glbModelUrl is supplied.
 */
export function buildProceduralInteractiveObject(
  type: ProceduralObjectType
): THREE.Group {
  const root = new THREE.Group();
  root.name = `interactive-${type}`;

  const brassMat = new THREE.MeshStandardMaterial({
    color: 0xc9a66b,
    metalness: 0.88,
    roughness: 0.22,
  });
  const darkForestMat = new THREE.MeshStandardMaterial({
    color: 0x203b30,
    metalness: 0.15,
    roughness: 0.42,
  });
  const walnutMat = new THREE.MeshStandardMaterial({
    color: 0x6b4b3a,
    metalness: 0.05,
    roughness: 0.65,
  });
  const cedarMat = new THREE.MeshStandardMaterial({
    color: 0xa67652,
    metalness: 0.04,
    roughness: 0.72,
  });
  const ivoryMat = new THREE.MeshStandardMaterial({
    color: 0xf4ede2,
    metalness: 0.02,
    roughness: 0.55,
  });
  const dustyRoseMat = new THREE.MeshStandardMaterial({
    color: 0xc99595,
    metalness: 0.08,
    roughness: 0.5,
  });
  const sageMat = new THREE.MeshStandardMaterial({
    color: 0x92977b,
    metalness: 0.05,
    roughness: 0.62,
  });
  const glassMat = new THREE.MeshPhysicalMaterial({
    color: 0xe6eff0,
    metalness: 0.05,
    roughness: 0.12,
    transparent: true,
    opacity: 0.58,
    clearcoat: 1.0,
  });

  if (type === 'fountain-pen') {
    // 1. Turned wooden studio plinth
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.48, 0.54, 0.08, 32),
      walnutMat
    );
    plinth.position.y = 0.04;
    root.add(plinth);

    // 2. Fluted glass inkwell body (LatheGeometry)
    const inkwellPoints = [
      new THREE.Vector2(0.0, 0.0),
      new THREE.Vector2(0.18, 0.0),
      new THREE.Vector2(0.2, 0.14),
      new THREE.Vector2(0.11, 0.2),
      new THREE.Vector2(0.11, 0.25),
      new THREE.Vector2(0.08, 0.25),
    ];
    const inkwell = new THREE.Mesh(
      new THREE.LatheGeometry(inkwellPoints, 20),
      glassMat
    );
    inkwell.position.set(-0.18, 0.08, 0.04);
    root.add(inkwell);

    // 3. Ink core inside inkwell
    const inkCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.14, 0.11, 18),
      darkForestMat
    );
    inkCore.position.set(-0.18, 0.14, 0.04);
    root.add(inkCore);

    // 4. Brass inkwell collar
    const collar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.115, 0.115, 0.05, 24),
      brassMat
    );
    collar.position.set(-0.18, 0.31, 0.04);
    root.add(collar);

    // 5. Fountain pen group resting diagonally on brass cradle
    const penGroup = new THREE.Group();
    penGroup.position.set(0.14, 0.22, 0);
    penGroup.rotation.z = -0.32;
    penGroup.rotation.y = 0.25;

    const barrel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.042, 0.036, 0.62, 24),
      darkForestMat
    );
    penGroup.add(barrel);

    const gripRing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.046, 0.035, 24),
      brassMat
    );
    gripRing.position.y = 0.18;
    penGroup.add(gripRing);

    const section = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.025, 0.14, 24),
      walnutMat
    );
    section.position.y = 0.27;
    penGroup.add(section);

    const nib = new THREE.Mesh(
      new THREE.ConeGeometry(0.024, 0.13, 4),
      brassMat
    );
    nib.position.y = 0.4;
    nib.scale.set(1.0, 1.0, 0.42);
    penGroup.add(nib);

    const endCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.036, 16, 16),
      brassMat
    );
    endCap.position.y = -0.31;
    penGroup.add(endCap);

    root.add(penGroup);
  } else if (type === 'mystery-box') {
    // 1. Carved rosewood base box
    const baseBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.74, 0.36, 0.56),
      walnutMat
    );
    baseBox.position.y = 0.18;
    root.add(baseBox);

    // 2. Beveled lid
    const lid = new THREE.Mesh(
      new THREE.BoxGeometry(0.78, 0.09, 0.6),
      dustyRoseMat
    );
    lid.position.set(0, 0.405, 0);
    root.add(lid);

    // 3. Brass corner clasps (4x)
    const claspGeo = new THREE.BoxGeometry(0.08, 0.44, 0.08);
    for (const sx of [-0.36, 0.36]) {
      for (const sz of [-0.27, 0.27]) {
        const clasp = new THREE.Mesh(claspGeo, brassMat);
        clasp.position.set(sx, 0.22, sz);
        root.add(clasp);
      }
    }

    // 4. Brass front lock escutcheon + dial ring
    const dial = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.018, 14, 28),
      brassMat
    );
    dial.position.set(0, 0.22, 0.29);
    root.add(dial);

    // 5. Floating antique skeleton key above the box
    const keyGroup = new THREE.Group();
    keyGroup.position.set(0, 0.64, 0);
    keyGroup.rotation.z = 0.18;

    const keyBow = new THREE.Mesh(
      new THREE.TorusGeometry(0.09, 0.018, 12, 24),
      brassMat
    );
    keyBow.position.x = -0.2;
    keyGroup.add(keyBow);

    const keyShaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.015, 0.015, 0.38, 14),
      brassMat
    );
    keyShaft.rotation.z = Math.PI / 2;
    keyShaft.position.x = 0.06;
    keyGroup.add(keyShaft);

    const keyTooth1 = new THREE.Mesh(
      new THREE.BoxGeometry(0.035, 0.07, 0.016),
      brassMat
    );
    keyTooth1.position.set(0.2, -0.04, 0);
    keyGroup.add(keyTooth1);

    const keyTooth2 = new THREE.Mesh(
      new THREE.BoxGeometry(0.025, 0.05, 0.016),
      brassMat
    );
    keyTooth2.position.set(0.14, -0.03, 0);
    keyGroup.add(keyTooth2);

    root.add(keyGroup);
  } else if (type === 'noahs-ark') {
    // 1. Stylized carved ocean wave plinth
    const wavePlinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.56, 0.6, 0.09, 32),
      sageMat
    );
    wavePlinth.position.y = 0.045;
    root.add(wavePlinth);

    // 2. Sculpted boat hull using ExtrudeGeometry
    const hullShape = new THREE.Shape();
    hullShape.moveTo(-0.48, 0.18);
    hullShape.quadraticCurveTo(0, -0.1, 0.48, 0.18);
    hullShape.lineTo(0.38, 0.34);
    hullShape.lineTo(-0.38, 0.34);
    hullShape.closePath();

    const hullGeo = new THREE.ExtrudeGeometry(hullShape, {
      depth: 0.34,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.025,
      bevelSegments: 3,
    });
    hullGeo.center();
    const hull = new THREE.Mesh(hullGeo, cedarMat);
    hull.position.set(0, 0.24, 0);
    root.add(hull);

    // 3. Ark wooden cabin
    const cabin = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.22, 0.24),
      walnutMat
    );
    cabin.position.set(0, 0.46, 0);
    root.add(cabin);

    // 4. Pitched roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(0.32, 0.16, 4),
      darkForestMat
    );
    roof.position.set(0, 0.64, 0);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.25, 1, 0.85);
    root.add(roof);

    // 5. Hovering stylized Ivory Dove with olive leaf
    const doveGroup = new THREE.Group();
    doveGroup.position.set(0.18, 0.86, 0.08);
    doveGroup.rotation.y = -0.4;

    const doveBody = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 16, 16),
      ivoryMat
    );
    doveBody.scale.set(1.4, 0.85, 0.9);
    doveGroup.add(doveBody);

    const wingGeo = new THREE.BoxGeometry(0.14, 0.015, 0.08);
    const wingL = new THREE.Mesh(wingGeo, ivoryMat);
    wingL.position.set(0, 0.03, -0.07);
    wingL.rotation.x = 0.45;
    doveGroup.add(wingL);

    const wingR = new THREE.Mesh(wingGeo, ivoryMat);
    wingR.position.set(0, 0.03, 0.07);
    wingR.rotation.x = -0.45;
    doveGroup.add(wingR);

    const oliveBranch = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.015, 0.025),
      sageMat
    );
    oliveBranch.position.set(0.1, -0.01, 0);
    oliveBranch.rotation.z = -0.25;
    doveGroup.add(oliveBranch);

    root.add(doveGroup);
  } else if (type === 'botanical-lantern') {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.34, 0.08, 6),
      brassMat
    );
    base.position.y = 0.04;
    root.add(base);

    const glassCore = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.2, 0.42, 6),
      glassMat
    );
    glassCore.position.y = 0.29;
    root.add(glassCore);

    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.18, 16),
      ivoryMat
    );
    candle.position.y = 0.17;
    root.add(candle);

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.028, 0.07, 12),
      new THREE.MeshStandardMaterial({
        color: 0xffd28a,
        emissive: 0xffaa44,
        emissiveIntensity: 1.6,
        roughness: 0.2,
      })
    );
    flame.position.y = 0.29;
    root.add(flame);

    // 4 corner brass pillars
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2;
      const pillar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.014, 0.46, 8),
        brassMat
      );
      pillar.position.set(Math.cos(ang) * 0.22, 0.29, Math.sin(ang) * 0.22);
      root.add(pillar);
    }

    const cap = new THREE.Mesh(
      new THREE.ConeGeometry(0.3, 0.18, 6),
      darkForestMat
    );
    cap.position.y = 0.59;
    root.add(cap);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.06, 0.012, 10, 20),
      brassMat
    );
    ring.position.y = 0.72;
    root.add(ring);
  } else if (type === 'prayer-chalice') {
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.36, 0.42, 0.07, 28),
      sageMat
    );
    plinth.position.y = 0.035;
    root.add(plinth);

    const crossVert = new THREE.Mesh(
      new THREE.BoxGeometry(0.09, 0.62, 0.06),
      cedarMat
    );
    crossVert.position.set(-0.08, 0.38, 0);
    root.add(crossVert);

    const crossHoriz = new THREE.Mesh(
      new THREE.BoxGeometry(0.38, 0.09, 0.06),
      cedarMat
    );
    crossHoriz.position.set(-0.08, 0.48, 0);
    root.add(crossHoriz);

    const scroll = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.065, 0.42, 20),
      ivoryMat
    );
    scroll.rotation.z = Math.PI / 2;
    scroll.rotation.y = 0.35;
    scroll.position.set(0.14, 0.14, 0.12);
    root.add(scroll);

    const ribbon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.04, 20),
      dustyRoseMat
    );
    ribbon.rotation.z = Math.PI / 2;
    ribbon.rotation.y = 0.35;
    ribbon.position.set(0.14, 0.14, 0.12);
    root.add(ribbon);
  } else if (type === 'royal-harp') {
    // 1. Studio walnut pedestal
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.46, 0.52, 0.08, 32),
      walnutMat
    );
    plinth.position.y = 0.04;
    root.add(plinth);

    // 2. Shepherd's golden-oak Harp frame
    const harpGroup = new THREE.Group();
    harpGroup.position.set(-0.1, 0.08, 0);

    const harpBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.06, 0.09),
      cedarMat
    );
    harpBase.position.y = 0.03;
    harpGroup.add(harpBase);

    const harpPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.03, 0.62, 16),
      brassMat
    );
    harpPillar.position.set(-0.13, 0.34, 0);
    harpPillar.rotation.z = 0.1;
    harpGroup.add(harpPillar);

    const soundboard = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.048, 0.54, 16),
      cedarMat
    );
    soundboard.position.set(0.12, 0.28, 0);
    soundboard.rotation.z = 0.32;
    harpGroup.add(soundboard);

    const neckCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.16, 0.64, 0),
      new THREE.Vector3(-0.02, 0.72, 0),
      new THREE.Vector3(0.18, 0.55, 0),
    ]);
    const neckMesh = new THREE.Mesh(
      new THREE.TubeGeometry(neckCurve, 18, 0.024, 10, false),
      brassMat
    );
    harpGroup.add(neckMesh);

    // Harp strings (5 brass strings)
    for (let s = 0; s < 5; s++) {
      const sx = -0.09 + s * 0.045;
      const sh = 0.56 - s * 0.035;
      const strMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.005, 0.005, sh, 8),
        brassMat
      );
      strMesh.position.set(sx, 0.08 + sh / 2, 0);
      harpGroup.add(strMesh);
    }
    root.add(harpGroup);

    // 3. Royal Crown resting beside harp
    const crownGroup = new THREE.Group();
    crownGroup.position.set(0.22, 0.14, 0.14);
    const crownBand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.11, 0.09, 24, 1, true),
      brassMat
    );
    crownBand.material = brassMat.clone();
    crownBand.material.side = THREE.DoubleSide;
    crownGroup.add(crownBand);
    for (let p = 0; p < 5; p++) {
      const ang = (p / 5) * Math.PI * 2;
      const point = new THREE.Mesh(
        new THREE.ConeGeometry(0.028, 0.075, 4),
        brassMat
      );
      point.position.set(Math.cos(ang) * 0.12, 0.075, Math.sin(ang) * 0.12);
      crownGroup.add(point);
    }
    root.add(crownGroup);

    // 4. Five Smooth River Stones
    const stoneMat = new THREE.MeshStandardMaterial({
      color: 0x8f8a82,
      roughness: 0.48,
      metalness: 0.06,
    });
    const stoneOffsets = [
      [-0.26, 0.11, 0.22],
      [-0.18, 0.11, 0.26],
      [-0.1, 0.11, 0.23],
      [-0.22, 0.11, 0.15],
      [-0.14, 0.15, 0.21],
    ];
    for (const [sx, sy, sz] of stoneOffsets) {
      const stone = new THREE.Mesh(
        new THREE.SphereGeometry(0.038, 14, 14),
        stoneMat
      );
      stone.scale.set(1.25, 0.72, 1.0);
      stone.position.set(sx, sy, sz);
      root.add(stone);
    }
  } else {
    // origami-crane
    const plinth = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.38, 0.06, 24),
      walnutMat
    );
    plinth.position.y = 0.03;
    root.add(plinth);

    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.28, 12),
      brassMat
    );
    stem.position.y = 0.2;
    root.add(stem);

    const body = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.14, 0),
      ivoryMat
    );
    body.scale.set(1.6, 0.7, 0.85);
    body.position.y = 0.38;
    root.add(body);

    const wingGeo = new THREE.ConeGeometry(0.18, 0.34, 3);
    const wingL = new THREE.Mesh(wingGeo, dustyRoseMat);
    wingL.position.set(0, 0.48, -0.2);
    wingL.rotation.x = -Math.PI / 2.6;
    root.add(wingL);

    const wingR = new THREE.Mesh(wingGeo, dustyRoseMat);
    wingR.position.set(0, 0.48, 0.2);
    wingR.rotation.x = Math.PI / 2.6;
    root.add(wingR);

    const neck = new THREE.Mesh(
      new THREE.ConeGeometry(0.04, 0.26, 4),
      ivoryMat
    );
    neck.position.set(0.18, 0.5, 0);
    neck.rotation.z = -0.45;
    root.add(neck);
  }

  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });

  return root;
}

/**
 * Loads an external GLB/GLTF model if provided, otherwise resolves immediately with the procedural model.
 */
export async function loadInteractiveObject3D(
  type: ProceduralObjectType,
  glbModelUrl?: string
): Promise<THREE.Group> {
  if (!glbModelUrl) {
    return buildProceduralInteractiveObject(type);
  }
  const loader = new GLTFLoader();
  try {
    const gltf = await loader.loadAsync(glbModelUrl);
    const wrapper = new THREE.Group();
    const box = new THREE.Box3().setFromObject(gltf.scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const targetScale = 0.85 / maxDim;
    gltf.scene.scale.setScalar(targetScale);
    const center = new THREE.Vector3();
    box.getCenter(center);
    gltf.scene.position.sub(center.multiplyScalar(targetScale));
    gltf.scene.position.y += (size.y * targetScale) / 2;
    wrapper.add(gltf.scene);
    return wrapper;
  } catch {
    return buildProceduralInteractiveObject(type);
  }
}
