import * as THREE from 'three';
import type { BookProduct, BookSpread } from '../data/catalogue';
import {
  createBackCoverTexture,
  createFrontCoverTexture,
  createPageBlockEdgeTexture,
  createSpineTexture,
  createSpreadPageTexture,
} from './bookTextures';

export interface Book3DController {
  root: THREE.Group;
  bookPivot: THREE.Group;
  frontCoverPivot: THREE.Group;
  backCoverPivot: THREE.Group;
  hotspotMesh: THREE.Mesh;
  setOpenAmount: (amount: number) => void;
  setSpread: (spreadIndex: number, highlightHotspot?: boolean) => void;
  setPageTurnProgress: (progress: number, direction: 1 | -1) => void;
  dispose: () => void;
}

export function createBook3D(
  book: BookProduct,
  options: {
    maxAnisotropy?: number;
    bumpTexture?: THREE.Texture;
    initialSpreadIndex?: number;
  } = {}
): Book3DController {
  const maxAnisotropy = options.maxAnisotropy ?? 4;
  const W = book.physicalDimensionsRatio.width;
  const H = book.physicalDimensionsRatio.height;
  const T = book.physicalDimensionsRatio.thickness;
  const boardThickness = 0.028;
  const pageBlockThickness = T - boardThickness * 2;
  const pageW = W - 0.05;
  const pageH = H - 0.06;

  const root = new THREE.Group();
  root.name = `book-3d-${book.id}`;

  const bookPivot = new THREE.Group();
  root.add(bookPivot);

  // Textures
  const frontTex = createFrontCoverTexture(book, maxAnisotropy);
  const backTex = createBackCoverTexture(book, maxAnisotropy);
  const spineTex = createSpineTexture(book, maxAnisotropy);
  const pageEdgeTex = createPageBlockEdgeTexture(maxAnisotropy);

  const coverBoardMat = new THREE.MeshStandardMaterial({
    color: book.coverTheme.coverColor,
    roughness: 0.72,
    metalness: 0.04,
    bumpMap: options.bumpTexture || null,
    bumpScale: 0.004,
  });

  const spineMat = new THREE.MeshStandardMaterial({
    map: spineTex,
    roughness: 0.68,
    metalness: 0.06,
    bumpMap: options.bumpTexture || null,
    bumpScale: 0.005,
  });

  const frontFaceMat = new THREE.MeshStandardMaterial({
    map: frontTex,
    roughness: 0.64,
    metalness: 0.06,
    bumpMap: options.bumpTexture || null,
    bumpScale: 0.003,
  });

  const backFaceMat = new THREE.MeshStandardMaterial({
    map: backTex,
    roughness: 0.68,
    metalness: 0.04,
    bumpMap: options.bumpTexture || null,
    bumpScale: 0.003,
  });

  const endpaperMat = new THREE.MeshStandardMaterial({
    color: 0xeae1d3,
    roughness: 0.85,
    metalness: 0.0,
  });

  const pageEdgeMat = new THREE.MeshStandardMaterial({
    map: pageEdgeTex,
    roughness: 0.88,
    metalness: 0.0,
  });

  const ribbonMat = new THREE.MeshStandardMaterial({
    color: book.coverTheme.accentColor,
    roughness: 0.52,
    metalness: 0.05,
    side: THREE.DoubleSide,
  });

  // Pivots
  const backCoverPivot = new THREE.Group();
  const frontCoverPivot = new THREE.Group();
  bookPivot.add(backCoverPivot);
  bookPivot.add(frontCoverPivot);

  // Back Board (extends +X from 0 to W)
  const backBoardGeo = new THREE.BoxGeometry(W, H, boardThickness);
  const backBoardMats = [
    coverBoardMat, // +X
    coverBoardMat, // -X
    coverBoardMat, // +Y
    coverBoardMat, // -Y
    endpaperMat,   // +Z (inside facing front)
    backFaceMat,   // -Z (outside back cover)
  ];
  const backBoard = new THREE.Mesh(backBoardGeo, backBoardMats);
  backBoard.position.set(W / 2, 0, -pageBlockThickness / 2 - boardThickness / 2);
  backBoard.castShadow = true;
  backBoard.receiveShadow = true;
  backCoverPivot.add(backBoard);

  // Right Page Stack resting inside Back Board
  const rightStackThickness = pageBlockThickness * 0.5;
  const rightStackGeo = new THREE.BoxGeometry(pageW, pageH, rightStackThickness);
  const rightPageSurfaceMat = new THREE.MeshStandardMaterial({
    color: 0xf7f2e9,
    roughness: 0.86,
    metalness: 0.0,
  });
  const rightStackMats = [
    pageEdgeMat,
    pageEdgeMat,
    pageEdgeMat,
    pageEdgeMat,
    rightPageSurfaceMat, // +Z visible open right page
    endpaperMat,
  ];
  const rightStack = new THREE.Mesh(rightStackGeo, rightStackMats);
  rightStack.position.set(pageW / 2 + 0.018, 0, -rightStackThickness / 2);
  rightStack.castShadow = true;
  rightStack.receiveShadow = true;
  backCoverPivot.add(rightStack);

  // Front Board (pivots around spine edge at x = 0)
  const frontBoardGeo = new THREE.BoxGeometry(W, H, boardThickness);
  const frontBoardMats = [
    coverBoardMat,
    coverBoardMat,
    coverBoardMat,
    coverBoardMat,
    frontFaceMat, // +Z outside front cover
    endpaperMat,  // -Z inside front cover
  ];
  const frontBoard = new THREE.Mesh(frontBoardGeo, frontBoardMats);
  frontBoard.position.set(W / 2, 0, pageBlockThickness / 2 + boardThickness / 2);
  frontBoard.castShadow = true;
  frontBoard.receiveShadow = true;
  frontCoverPivot.add(frontBoard);

  // Left Page Stack attached inside Front Board
  const leftStackThickness = pageBlockThickness * 0.5;
  const leftStackGeo = new THREE.BoxGeometry(pageW, pageH, leftStackThickness);
  const leftPageSurfaceMat = new THREE.MeshStandardMaterial({
    color: 0xf7f2e9,
    roughness: 0.86,
    metalness: 0.0,
  });
  const leftStackMats = [
    pageEdgeMat,
    pageEdgeMat,
    pageEdgeMat,
    pageEdgeMat,
    endpaperMat,
    leftPageSurfaceMat, // -Z visible when front cover opens
  ];
  const leftStack = new THREE.Mesh(leftStackGeo, leftStackMats);
  leftStack.position.set(pageW / 2 + 0.018, 0, leftStackThickness / 2);
  leftStack.castShadow = true;
  leftStack.receiveShadow = true;
  frontCoverPivot.add(leftStack);

  // Rounded Spine Bridge
  const spineGeo = new THREE.BoxGeometry(0.055, H + 0.004, T + 0.004);
  const spineMaterials = [
    coverBoardMat,
    spineMat, // -X visible outer spine!
    coverBoardMat,
    coverBoardMat,
    coverBoardMat,
    coverBoardMat,
  ];
  const spineMesh = new THREE.Mesh(spineGeo, spineMaterials);
  spineMesh.position.set(-0.015, 0, 0);
  spineMesh.castShadow = true;
  spineMesh.receiveShadow = true;
  bookPivot.add(spineMesh);

  // Silk Ribbon Bookmark peeking out the bottom
  const ribbonGeo = new THREE.PlaneGeometry(0.065, 0.34, 1, 6);
  const rPos = ribbonGeo.attributes.position;
  for (let i = 0; i < rPos.count; i++) {
    const ry = rPos.getY(i);
    rPos.setZ(i, Math.sin((ry + 0.17) * 8) * 0.015);
  }
  ribbonGeo.computeVertexNormals();
  const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
  ribbonMesh.position.set(W * 0.45, -H / 2 - 0.12, 0.01);
  ribbonMesh.rotation.z = 0.08;
  backCoverPivot.add(ribbonMesh);

  // Animated Curved Turning Page Mesh
  const segX = 24;
  const segY = 6;
  const turningPageGeo = new THREE.PlaneGeometry(pageW, pageH, segX, segY);
  // Shift geometry so left edge (spine hinge) is at x = 0
  turningPageGeo.translate(pageW / 2, 0, 0);
  const baseTurningPositions = Float32Array.from(
    turningPageGeo.attributes.position.array as Float32Array
  );
  const turningPageMat = new THREE.MeshStandardMaterial({
    color: 0xf7f2e9,
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const turningPageMesh = new THREE.Mesh(turningPageGeo, turningPageMat);
  turningPageMesh.position.set(0.018, 0, 0.005);
  turningPageMesh.visible = false;
  turningPageMesh.castShadow = true;
  bookPivot.add(turningPageMesh);

  // Interactive Illustration Hotspot Proxy Plane (sits subtly on lower right open page)
  const hotspotGeo = new THREE.PlaneGeometry(pageW * 0.76, pageH * 0.34);
  const hotspotMat = new THREE.MeshBasicMaterial({
    color: 0xc99595,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
  });
  const hotspotMesh = new THREE.Mesh(hotspotGeo, hotspotMat);
  hotspotMesh.position.set(pageW / 2 + 0.018, -pageH * 0.17, 0.012);
  hotspotMesh.userData.isInteractiveHotspot = true;
  hotspotMesh.visible = false;
  backCoverPivot.add(hotspotMesh);

  let currentOpenAmount = 0;
  let currentSpreadIndex = options.initialSpreadIndex ?? 0;

  function applySpreadTextures(spreadIdx: number, highlight = false) {
    const spreads: BookSpread[] = book.spreads;
    if (!spreads.length) return;
    const safeIdx = Math.max(0, Math.min(spreads.length - 1, spreadIdx));
    currentSpreadIndex = safeIdx;
    const spread = spreads[safeIdx];

    const leftTex = createSpreadPageTexture(
      book,
      spread.leftPage,
      'left',
      false,
      maxAnisotropy
    );
    const rightTex = createSpreadPageTexture(
      book,
      spread.rightPage,
      'right',
      highlight,
      maxAnisotropy
    );

    leftPageSurfaceMat.map = leftTex;
    leftPageSurfaceMat.needsUpdate = true;

    rightPageSurfaceMat.map = rightTex;
    rightPageSurfaceMat.needsUpdate = true;

    turningPageMat.map = rightTex;
    turningPageMat.needsUpdate = true;

    hotspotMesh.visible = Boolean(spread.rightPage.interactiveObject) && currentOpenAmount > 0.55;
  }

  function setOpenAmount(amount: number) {
    currentOpenAmount = THREE.MathUtils.clamp(amount, 0, 1);
    // Center the closed book at x = 0, and center the open spine at x = 0
    bookPivot.position.x = THREE.MathUtils.lerp(-W / 2, 0, currentOpenAmount);

    // Front cover swings open from 0 to -162 degrees (-2.83 rad)
    frontCoverPivot.rotation.y = -currentOpenAmount * 2.82;
    // Back cover cradles gently open to -16 degrees (-0.28 rad)
    backCoverPivot.rotation.y = -currentOpenAmount * 0.28;

    // Slight spine tilt when open
    spineMesh.rotation.y = -currentOpenAmount * 1.4;
    spineMesh.position.x = -0.015;

    const spread = book.spreads[currentSpreadIndex];
    hotspotMesh.visible =
      Boolean(spread?.rightPage.interactiveObject) && currentOpenAmount > 0.55;
  }

  function setPageTurnProgress(progress: number, direction: 1 | -1) {
    const p = THREE.MathUtils.clamp(progress, 0, 1);
    if (p <= 0.001 || p >= 0.999) {
      turningPageMesh.visible = false;
      return;
    }
    turningPageMesh.visible = true;

    const startAngle = backCoverPivot.rotation.y;
    const endAngle = frontCoverPivot.rotation.y;
    const sweepT = direction === 1 ? p : 1 - p;
    turningPageMesh.rotation.y = THREE.MathUtils.lerp(startAngle, endAngle, sweepT);

    // Apply physical paper curl arc across page width
    const posAttr = turningPageGeo.attributes.position;
    const curlStrength = Math.sin(p * Math.PI) * 0.22;
    for (let i = 0; i < posAttr.count; i++) {
      const bx = baseTurningPositions[i * 3];
      const by = baseTurningPositions[i * 3 + 1];
      const u = THREE.MathUtils.clamp(bx / pageW, 0, 1);
      const bend = Math.sin(u * Math.PI) * curlStrength * (direction === 1 ? 1 : -1);
      posAttr.setXYZ(i, bx, by, bend);
    }
    posAttr.needsUpdate = true;
    turningPageGeo.computeVertexNormals();
  }

  applySpreadTextures(currentSpreadIndex, false);
  setOpenAmount(0);

  return {
    root,
    bookPivot,
    frontCoverPivot,
    backCoverPivot,
    hotspotMesh,
    setOpenAmount,
    setSpread: applySpreadTextures,
    setPageTurnProgress,
    dispose: () => {
      backBoardGeo.dispose();
      rightStackGeo.dispose();
      frontBoardGeo.dispose();
      leftStackGeo.dispose();
      spineGeo.dispose();
      ribbonGeo.dispose();
      turningPageGeo.dispose();
      hotspotGeo.dispose();
      coverBoardMat.dispose();
      spineMat.dispose();
      frontFaceMat.dispose();
      backFaceMat.dispose();
      endpaperMat.dispose();
      pageEdgeMat.dispose();
      ribbonMat.dispose();
      rightPageSurfaceMat.dispose();
      leftPageSurfaceMat.dispose();
      turningPageMat.dispose();
      hotspotMat.dispose();
    },
  };
}
