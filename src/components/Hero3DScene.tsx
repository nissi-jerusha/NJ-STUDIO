import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BookOpen, ChevronLeft, ChevronRight, Maximize2, RotateCw, X } from 'lucide-react';
import { PUBLISHED_BOOKS, type BookProduct } from '../data/catalogue';
import { createBook3D, type Book3DController } from '../three/BookMeshBuilder';
import {
  afterDraw,
  applyStudioEnvironment,
  createClothPaperNormalBumpTexture,
  detectSoftwareWebGL,
  isWebGLAvailable,
} from '../three/webglUtils';

gsap.registerPlugin(ScrollTrigger);

interface Hero3DSceneProps {
  onSelectBook: (book: BookProduct) => void;
  onExploreBooks: () => void;
  onDiscoverStory: () => void;
}

export const Hero3DScene: React.FC<Hero3DSceneProps> = ({
  onSelectBook,
  onExploreBooks,
  onDiscoverStory,
}) => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasMountRef = useRef<HTMLDivElement>(null);

  const heroBook =
    PUBLISHED_BOOKS.find((b) => b.isHeroFeatured) || PUBLISHED_BOOKS[0];
  const leftBookData =
    PUBLISHED_BOOKS.find((b) => b.id === 'mystery-box-whats-inside') ||
    PUBLISHED_BOOKS[1];
  const rightBookData =
    PUBLISHED_BOOKS.find((b) => b.id === 'noahs-ark-journey-of-faith') ||
    PUBLISHED_BOOKS[2];
  const fourthBookData =
    PUBLISHED_BOOKS.find((b) => b.id === 'quiet-morning-prayer-journal') ||
    PUBLISHED_BOOKS[0];

  const [isBookOpen, setIsBookOpen] = useState(false);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [webglReady, setWebglReady] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const heroControllerRef = useRef<Book3DController | null>(null);
  const heroGroupRef = useRef<THREE.Group | null>(null);
  const openStateRef = useRef({ value: 0 });
  const scrollProgressRef = useRef({ value: 0 });
  const isDraggingRef = useRef(false);
  const dragVelocityRef = useRef({ x: 0, y: 0 });
  const targetRotRef = useRef({ x: -0.06, y: 0.24 });
  const pointerParallaxRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', listener);
    return () => mq.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      setWebglReady(false);
      return;
    }
    const container = canvasMountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 1280;
    const height = container.clientHeight || 680;
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x211813);
    scene.fog = new THREE.FogExp2(0x211813, 0.065);

    const envTex = applyStudioEnvironment(renderer, scene, 0.05);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const bumpTex = createClothPaperNormalBumpTexture(256);

    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 60);
    camera.position.set(0, 0.25, 7.6);

    // 3-Point Warm Studio Library Lighting
    const hemiLight = new THREE.HemisphereLight(0xf6ebe0, 0x2a1d17, 0.85);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff1dc, 2.1);
    keyLight.position.set(3.8, 5.2, 5.5);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe7c2c0, 0.9);
    rimLight.position.set(-4.5, 2.5, -2.5);
    scene.add(rimLight);

    const warmSpot = new THREE.PointLight(0xffcb8c, 3.2, 14);
    warmSpot.position.set(0, 2.4, 3.4);
    scene.add(warmSpot);

    // Procedural Library Bookshelf Backdrop (Zero 404s)
    const shelfGroup = new THREE.Group();
    shelfGroup.position.set(0, 0, -4.6);
    const woodMat = new THREE.MeshStandardMaterial({
      color: 0x2c1f18,
      roughness: 0.85,
      metalness: 0.05,
    });
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 12),
      new THREE.MeshStandardMaterial({ color: 0x1b130e, roughness: 0.95 })
    );
    backWall.position.z = -0.45;
    shelfGroup.add(backWall);

    // Horizontal & vertical library shelving beams
    for (const sy of [-2.4, -0.8, 0.8, 2.4]) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(22, 0.12, 0.9), woodMat);
      plank.position.set(0, sy, 0);
      shelfGroup.add(plank);
    }
    for (const sx of [-6.8, -3.4, 0, 3.4, 6.8]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 10, 0.9), woodMat);
      pillar.position.set(sx, 0, 0);
      shelfGroup.add(pillar);
    }

    // Instanced background library books
    const shelfBookGeo = new THREE.BoxGeometry(0.18, 1.12, 0.72);
    const shelfBookMat = new THREE.MeshStandardMaterial({
      roughness: 0.78,
      metalness: 0.04,
    });
    const paletteHex = [0x3d2e26, 0x203b30, 0x5c463a, 0x4b5140, 0x6f514b, 0x342822];
    const totalShelfBooks = 140;
    const shelfInstanced = new THREE.InstancedMesh(
      shelfBookGeo,
      shelfBookMat,
      totalShelfBooks
    );
    const dummy = new THREE.Object3D();
    const color = new THREE.Color();
    let idx = 0;
    for (const rowY of [-1.8, -0.2, 1.4]) {
      for (let x = -7.8; x <= 7.8 && idx < totalShelfBooks; x += 0.34) {
        if (Math.abs(x % 3.4) < 0.25) continue;
        const hScale = 0.82 + ((idx * 17) % 10) * 0.032;
        dummy.position.set(x, rowY + (hScale - 1) * 0.5, -0.05);
        dummy.scale.set(0.8 + ((idx * 7) % 5) * 0.1, hScale, 1);
        dummy.rotation.z = idx % 11 === 0 ? 0.08 : 0;
        dummy.updateMatrix();
        shelfInstanced.setMatrixAt(idx, dummy.matrix);
        color.setHex(paletteHex[idx % paletteHex.length]);
        shelfInstanced.setColorAt(idx, color);
        idx++;
      }
    }
    shelfInstanced.count = idx;
    shelfInstanced.instanceMatrix.needsUpdate = true;
    if (shelfInstanced.instanceColor) shelfInstanced.instanceColor.needsUpdate = true;
    shelfInstanced.computeBoundingSphere();
    shelfGroup.add(shelfInstanced);
    scene.add(shelfGroup);

    // Featured Center Hero Book
    const heroBook3D = createBook3D(heroBook, {
      maxAnisotropy: maxAniso,
      bumpTexture: bumpTex,
    });
    const heroPivotGroup = new THREE.Group();
    heroPivotGroup.position.set(0, 0.42, 0.55);
    heroPivotGroup.scale.setScalar(1.06);
    heroPivotGroup.add(heroBook3D.root);
    scene.add(heroPivotGroup);
    heroControllerRef.current = heroBook3D;
    heroGroupRef.current = heroPivotGroup;

    // Flanking Floating Books (Matching the attached editorial composition)
    const leftOuterBook = createBook3D(leftBookData, {
      maxAnisotropy: maxAniso,
      bumpTexture: bumpTex,
    });
    const leftOuterGroup = new THREE.Group();
    leftOuterGroup.position.set(-4.35, 0.52, -0.95);
    leftOuterGroup.rotation.set(0.1, 0.42, 0.14);
    leftOuterGroup.scale.setScalar(0.84);
    leftOuterGroup.add(leftOuterBook.root);
    scene.add(leftOuterGroup);

    const leftInnerBook = createBook3D(fourthBookData, {
      maxAnisotropy: maxAniso,
      bumpTexture: bumpTex,
    });
    const leftInnerGroup = new THREE.Group();
    leftInnerGroup.position.set(-2.35, 0.34, -0.45);
    leftInnerGroup.rotation.set(-0.08, 0.65, -0.06);
    leftInnerGroup.scale.setScalar(0.88);
    leftInnerGroup.add(leftInnerBook.root);
    scene.add(leftInnerGroup);

    const rightInnerBook = createBook3D(rightBookData, {
      maxAnisotropy: maxAniso,
      bumpTexture: bumpTex,
    });
    const rightInnerGroup = new THREE.Group();
    rightInnerGroup.position.set(2.35, 0.46, -0.35);
    // Show back cover & spine angle just like the reference image!
    rightInnerGroup.rotation.set(0.05, Math.PI - 0.52, -0.07);
    rightInnerGroup.scale.setScalar(0.92);
    rightInnerGroup.add(rightInnerBook.root);
    scene.add(rightInnerGroup);

    const rightOpenBook = createBook3D(heroBook, {
      maxAnisotropy: maxAniso,
      bumpTexture: bumpTex,
    });
    rightOpenBook.setOpenAmount(0.85);
    const rightOpenGroup = new THREE.Group();
    rightOpenGroup.position.set(4.55, 0.3, -1.15);
    rightOpenGroup.rotation.set(0.18, -0.45, -0.08);
    rightOpenGroup.scale.setScalar(0.82);
    rightOpenGroup.add(rightOpenBook.root);
    scene.add(rightOpenGroup);

    // Subtle floating dust motes in studio light
    const dustCount = 48;
    const dustGeo = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 11;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 4 + 0.5;
    }
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: 0xf6dfc0,
      size: 0.032,
      transparent: true,
      opacity: 0.45,
    });
    const dustPoints = new THREE.Points(dustGeo, dustMat);
    scene.add(dustPoints);

    // Pointer drag-to-rotate 360° & subtle hover parallax
    let lastX = 0;
    let lastY = 0;
    const domEl = renderer.domElement;

    const onPointerDown = (e: PointerEvent) => {
      isDraggingRef.current = true;
      lastX = e.clientX;
      lastY = e.clientY;
      domEl.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = domEl.getBoundingClientRect();
      pointerParallaxRef.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerParallaxRef.current.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;

      targetRotRef.current.y += dx * 0.011;
      targetRotRef.current.x = THREE.MathUtils.clamp(
        targetRotRef.current.x + dy * 0.008,
        -0.65,
        0.65
      );
      dragVelocityRef.current.y = dx * 0.003;
    };

    const onPointerUp = (e: PointerEvent) => {
      isDraggingRef.current = false;
      try {
        domEl.releasePointerCapture(e.pointerId);
      } catch {
        // ignore if already released
      }
    };

    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('pointerup', onPointerUp);
    domEl.addEventListener('pointercancel', onPointerUp);

    // GSAP ScrollTrigger smooth scroll glide
    const scrollTrigger = ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
      onUpdate: (self) => {
        scrollProgressRef.current.value = self.progress;
      },
    });

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 1280;
      const h = container.clientHeight || 680;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Render Loop with software-GL pacing
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    const tick = () => {
      if (disposed) return;
      const delta = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      if (!isDraggingRef.current) {
        targetRotRef.current.y += dragVelocityRef.current.y;
        dragVelocityRef.current.y *= 0.92;
      }

      const scrollP = scrollProgressRef.current.value;
      const motionMult = reducedMotion ? 0 : 1;

      // Featured Hero Book float + scroll choreography + mouse parallax
      const floatY = Math.sin(elapsed * 1.15) * 0.075 * motionMult;
      heroPivotGroup.position.y = 0.42 + floatY - scrollP * 0.65;
      heroPivotGroup.position.z = 0.55 + scrollP * 0.9;
      heroPivotGroup.rotation.y = THREE.MathUtils.damp(
        heroPivotGroup.rotation.y,
        targetRotRef.current.y + pointerParallaxRef.current.x * 0.14 + scrollP * 0.7,
        6,
        delta
      );
      heroPivotGroup.rotation.x = THREE.MathUtils.damp(
        heroPivotGroup.rotation.x,
        targetRotRef.current.x + pointerParallaxRef.current.y * 0.09,
        6,
        delta
      );

      // Flanking books gentle float
      leftOuterGroup.position.y = 0.52 + Math.sin(elapsed * 0.9 + 1.2) * 0.09 * motionMult;
      leftInnerGroup.position.y = 0.34 + Math.sin(elapsed * 1.05 + 2.4) * 0.07 * motionMult;
      rightInnerGroup.position.y = 0.46 + Math.sin(elapsed * 0.95 + 0.5) * 0.08 * motionMult;
      rightOpenGroup.position.y = 0.3 + Math.sin(elapsed * 0.85 + 3.1) * 0.07 * motionMult;

      // Gentle camera parallax
      camera.position.x = THREE.MathUtils.damp(
        camera.position.x,
        pointerParallaxRef.current.x * 0.28 * motionMult,
        4,
        delta
      );
      camera.position.y = THREE.MathUtils.damp(
        camera.position.y,
        0.25 - pointerParallaxRef.current.y * 0.18 * motionMult,
        4,
        delta
      );
      camera.lookAt(0, 0.15, 0);

      dustPoints.rotation.y = elapsed * 0.02 * motionMult;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        frameId = afterDraw(renderer, tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    tick();

    const onContextLost = (ev: Event) => {
      ev.preventDefault();
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
    };
    domEl.addEventListener('webglcontextlost', onContextLost);

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      scrollTrigger.kill();
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('pointercancel', onPointerUp);
      domEl.removeEventListener('webglcontextlost', onContextLost);
      heroBook3D.dispose();
      leftOuterBook.dispose();
      leftInnerBook.dispose();
      rightInnerBook.dispose();
      rightOpenBook.dispose();
      shelfBookGeo.dispose();
      shelfBookMat.dispose();
      dustGeo.dispose();
      dustMat.dispose();
      bumpTex.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, [heroBook, leftBookData, rightBookData, fourthBookData, reducedMotion]);

  const handleToggleOpenHeroBook = () => {
    const nextOpen = !isBookOpen;
    setIsBookOpen(nextOpen);
    const ctrl = heroControllerRef.current;
    if (!ctrl) return;

    gsap.to(openStateRef.current, {
      value: nextOpen ? 1 : 0,
      duration: reducedMotion ? 0.05 : 1.05,
      ease: 'power3.inOut',
      onUpdate: () => {
        ctrl.setOpenAmount(openStateRef.current.value);
      },
    });

    if (nextOpen) {
      targetRotRef.current = { x: -0.04, y: 0.02 };
    } else {
      targetRotRef.current = { x: -0.06, y: 0.24 };
    }
  };

  const handleTurnHeroPage = (dir: 1 | -1) => {
    const ctrl = heroControllerRef.current;
    if (!ctrl || !isBookOpen) return;
    const total = heroBook.spreads.length;
    const nextIdx = (spreadIndex + dir + total) % total;
    const animObj = { p: 0 };

    gsap.to(animObj, {
      p: 1,
      duration: reducedMotion ? 0.05 : 0.72,
      ease: 'power2.inOut',
      onUpdate: () => {
        ctrl.setPageTurnProgress(animObj.p, dir);
      },
      onComplete: () => {
        ctrl.setPageTurnProgress(0, dir);
        ctrl.setSpread(nextIdx, false);
        setSpreadIndex(nextIdx);
      },
    });
  };

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="relative w-full min-h-[680px] h-[84vh] max-h-[820px] bg-[#211813] overflow-hidden select-none"
    >
      {/* Interactive 3D WebGL Canvas Stage */}
      {webglReady ? (
        <div
          ref={canvasMountRef}
          aria-label="Interactive 3D Book Showcase — Drag to rotate books 360 degrees"
          className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        />
      ) : (
        /* Graceful Non-WebGL Fallback */
        <div className="absolute inset-0 bg-gradient-to-b from-[#2E211A] via-[#241A14] to-[#1A120E] flex items-center justify-center px-6">
          <div className="flex items-center gap-8 max-w-4xl">
            <div className="hidden sm:flex w-44 h-60 rounded-sm bg-[#D5B2B0] border border-[#765A4A]/40 shadow-2xl -rotate-6 flex-col justify-between p-5 text-[#2C221E]">
              <span className="text-[11px] uppercase tracking-widest opacity-70">NJ STUDIO</span>
              <span className="font-serif text-xl font-semibold leading-tight">{leftBookData.title}</span>
              <span className="text-[11px] opacity-60">Mystery & Discovery</span>
            </div>
            <div className="w-56 h-76 rounded-sm bg-[#F3ECE2] border-l-8 border-[#203B30] shadow-2xl flex flex-col justify-between p-6 text-[#203B30]">
              <span className="text-xs uppercase tracking-widest opacity-75">NJ STUDIO</span>
              <div>
                <h3 className="font-serif text-2xl font-semibold leading-tight">{heroBook.title}</h3>
                <p className="font-serif italic text-sm text-[#765A4A] mt-1">{heroBook.subtitle}</p>
              </div>
              <span className="text-[11px] opacity-70">Placeholder Cover · Ready for Art</span>
            </div>
            <div className="hidden sm:flex w-44 h-60 rounded-sm bg-[#8E957A] border border-[#203B30]/40 shadow-2xl rotate-6 flex-col justify-between p-5 text-[#F8F4EF]">
              <span className="text-[11px] uppercase tracking-widest opacity-80">NJ STUDIO</span>
              <span className="font-serif text-xl font-semibold leading-tight">{rightBookData.title}</span>
              <span className="text-[11px] opacity-75">Faith & Spirituality</span>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Bottom Scrim for High-Contrast Editorial Typography */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-[#19120E]/95 via-[#19120E]/55 to-transparent"
        aria-hidden="true"
      />

      {/* Top Subtle Drag Instruction Hint */}
      {webglReady && (
        <div className="pointer-events-none absolute top-5 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#19120E]/75 border border-[#F8F4EF]/15 text-[#F8F4EF]/85 text-xs tracking-wide">
          <RotateCw className="w-3.5 h-3.5 text-[#E7C2C0]" />
          <span>Drag to rotate 360°</span>
        </div>
      )}

      {/* Interactive Hero Book Controls & Editorial Copy Overlay */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex flex-col items-center text-center px-6 pb-10 md:pb-12">
        {/* Book-Specific Controls directly below the floating featured book */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-center gap-2.5 mb-5">
          <button
            type="button"
            onClick={handleToggleOpenHeroBook}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#2C221E]/90 hover:bg-[#203B30] text-[#F8F4EF] border border-[#F8F4EF]/25 text-xs font-medium tracking-wide transition-colors cursor-pointer whitespace-nowrap"
          >
            {isBookOpen ? (
              <>
                <X className="w-3.5 h-3.5" />
                <span>Close Book</span>
              </>
            ) : (
              <>
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Book</span>
              </>
            )}
          </button>

          {isBookOpen && (
            <>
              <button
                type="button"
                onClick={() => handleTurnHeroPage(-1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-[#F8F4EF]/15 hover:bg-[#F8F4EF]/25 text-[#F8F4EF] border border-[#F8F4EF]/20 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev Page</span>
              </button>
              <button
                type="button"
                onClick={() => handleTurnHeroPage(1)}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-md bg-[#F8F4EF]/15 hover:bg-[#F8F4EF]/25 text-[#F8F4EF] border border-[#F8F4EF]/20 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>Next Page</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => onSelectBook(heroBook)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-[#F8F4EF]/10 hover:bg-[#F8F4EF]/20 text-[#F8F4EF] border border-[#F8F4EF]/20 text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Inspect Full 3D Edition</span>
          </button>
        </div>

        <h1 className="font-serif text-[#F8F4EF] text-[clamp(2.35rem,4.5vw,3.9rem)] font-medium leading-[1.08] tracking-tight max-w-3xl text-balance">
          Books that inspire imagination.
        </h1>

        <p className="mt-3 text-sm md:text-base text-[#F8F4EF]/85 max-w-xl leading-relaxed">
          Explore a creative collection of journals, mystery books, faith-inspired
          activities, and original stories.
        </p>

        <div className="pointer-events-auto mt-6 flex flex-wrap items-center justify-center gap-3.5">
          <button
            type="button"
            onClick={onExploreBooks}
            className="px-6 py-2.5 rounded-sm bg-[#F8F4EF] hover:bg-[#E7C2C0] text-[#203B30] text-sm font-semibold tracking-wide transition-colors cursor-pointer whitespace-nowrap"
          >
            Explore Books
          </button>
          <button
            type="button"
            onClick={onDiscoverStory}
            className="px-6 py-2.5 rounded-sm bg-transparent hover:bg-[#F8F4EF]/10 text-[#F8F4EF] border border-[#F8F4EF]/55 text-sm font-medium tracking-wide transition-colors cursor-pointer whitespace-nowrap"
          >
            Discover Our Story
          </button>
        </div>
      </div>
    </section>
  );
};
