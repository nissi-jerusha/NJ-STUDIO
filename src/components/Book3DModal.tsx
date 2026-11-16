import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Cuboid,
  ExternalLink,
  Eye,
  Film,
  Heart,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShoppingBag,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import type { BookPageContent, BookProduct } from '../data/catalogue';
import { createBook3D, type Book3DController } from '../three/BookMeshBuilder';
import { loadInteractiveObject3D } from '../three/interactiveObjects';
import {
  afterDraw,
  applyStudioEnvironment,
  createClothPaperNormalBumpTexture,
  createContactShadowTexture,
  detectSoftwareWebGL,
  isWebGLAvailable,
} from '../three/webglUtils';

interface Book3DModalProps {
  book: BookProduct | null;
  onClose: () => void;
  onAddToBag: (book: BookProduct, format: 'physical' | 'digital') => void;
  isSaved: boolean;
  onToggleSave: (bookId: string) => void;
}

type CameraViewPreset = 'front' | 'spine' | 'back' | 'open';

export const Book3DModal: React.FC<Book3DModalProps> = ({
  book,
  onClose,
  onAddToBag,
  isSaved,
  onToggleSave,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const videoCanvasRef = useRef<HTMLCanvasElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [spreadIndex, setSpreadIndex] = useState(0);
  const [selectedEdition, setSelectedEdition] = useState<'physical' | 'digital'>('physical');
  const [activeObjectMode, setActiveObjectMode] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [videoPlaying, setVideoPlaying] = useState<boolean>(true);
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [hotspotHovered, setHotspotHovered] = useState<boolean>(false);
  const [webglSupported] = useState<boolean>(() => isWebGLAvailable());
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  const bookCtrlRef = useRef<Book3DController | null>(null);
  const interactiveObjGroupRef = useRef<THREE.Group | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const openStateRef = useRef({ value: 0 });
  const isTurningRef = useRef(false);
  const activeObjectModeRef = useRef(false);

  useEffect(() => {
    activeObjectModeRef.current = activeObjectMode;
  }, [activeObjectMode]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Reset modal states whenever book changes
  useEffect(() => {
    if (!book) return;
    setIsOpen(false);
    setSpreadIndex(0);
    setActiveObjectMode(false);
    setShowVideoModal(false);
    setSelectedEdition('physical');
    openStateRef.current.value = 0;
  }, [book?.id]);

  // Escape key close
  useEffect(() => {
    if (!book) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showVideoModal) {
          setShowVideoModal(false);
        } else if (activeObjectMode) {
          setActiveObjectMode(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [book, showVideoModal, activeObjectMode, onClose]);

  const currentSpread = book?.spreads[spreadIndex];
  const interactiveObjectConfig = currentSpread?.rightPage.interactiveObject;

  // Main Three.js Book + Interactive Object Studio Renderer
  useEffect(() => {
    if (!book || !webglSupported) return;
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const width = container.clientWidth || 720;
    const height = container.clientHeight || 560;
    renderer.setSize(width, height);
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf2ece3);
    scene.fog = new THREE.FogExp2(0xf2ece3, 0.032);

    const envTex = applyStudioEnvironment(renderer, scene, 0.04);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const bumpTex = createClothPaperNormalBumpTexture(256);
    const shadowTex = createContactShadowTexture();

    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 50);
    camera.position.set(0.35, 0.28, 4.35);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.enablePan = false;
    controls.minDistance = 2.1;
    controls.maxDistance = 7.2;
    controls.target.set(0, 0, 0);
    controlsRef.current = controls;

    // 3-Point Warm Studio Lighting
    const hemi = new THREE.HemisphereLight(0xfffaf2, 0x9c8b7b, 0.9);
    scene.add(hemi);

    const keyLight = new THREE.DirectionalLight(0xfff4e4, 2.0);
    keyLight.position.set(3.2, 4.6, 4.8);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.set(1024, 1024);
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0xe7c2c0, 0.85);
    rimLight.position.set(-4.0, 2.0, -3.0);
    scene.add(rimLight);

    // Contact shadow grounding plane
    const shadowPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(3.4, 3.4),
      new THREE.MeshBasicMaterial({
        map: shadowTex,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      })
    );
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.25;
    scene.add(shadowPlane);

    // Build reusable 3D Book
    const bookCtrl = createBook3D(book, {
      maxAnisotropy: maxAniso,
      bumpTexture: bumpTex,
      initialSpreadIndex: 0,
    });
    scene.add(bookCtrl.root);
    bookCtrlRef.current = bookCtrl;

    // Holder for the Interactive 3D Object inside the page
    const objectHolder = new THREE.Group();
    objectHolder.position.set(0, -0.35, 0);
    objectHolder.scale.setScalar(1.9);
    objectHolder.visible = false;
    scene.add(objectHolder);
    interactiveObjGroupRef.current = objectHolder;

    // Raycaster for clickable page illustration hotspots
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let lastMoveCheck = 0;

    const updatePointer = (ev: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (activeObjectModeRef.current || !bookCtrl.hotspotMesh.visible) {
        setHotspotHovered(false);
        return;
      }
      const now = performance.now();
      if (now - lastMoveCheck < 50) return;
      lastMoveCheck = now;

      updatePointer(ev);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(bookCtrl.hotspotMesh, false);
      const hit = hits.length > 0;
      setHotspotHovered(hit);
      renderer.domElement.style.cursor = hit ? 'pointer' : 'grab';
    };

    let downPos = { x: 0, y: 0 };
    const onPointerDown = (ev: PointerEvent) => {
      downPos = { x: ev.clientX, y: ev.clientY };
    };

    const onPointerUp = (ev: PointerEvent) => {
      const moved = Math.hypot(ev.clientX - downPos.x, ev.clientY - downPos.y);
      if (moved > 6 || activeObjectModeRef.current || !bookCtrl.hotspotMesh.visible) {
        return;
      }
      updatePointer(ev);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObject(bookCtrl.hotspotMesh, false);
      if (hits.length > 0) {
        setActiveObjectMode(true);
      }
    };

    const domEl = renderer.domElement;
    domEl.addEventListener('pointermove', onPointerMove);
    domEl.addEventListener('pointerdown', onPointerDown);
    domEl.addEventListener('pointerup', onPointerUp);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 560;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Loop
    let frameId = 0;
    let disposed = false;
    const clock = new THREE.Clock();

    const tick = () => {
      if (disposed) return;
      const elapsed = clock.getElapsedTime();

      if (activeObjectModeRef.current && objectHolder.visible && !reducedMotion) {
        objectHolder.rotation.y = elapsed * 0.45;
      }

      controls.update();
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
      window.removeEventListener('resize', handleResize);
      domEl.removeEventListener('pointermove', onPointerMove);
      domEl.removeEventListener('pointerdown', onPointerDown);
      domEl.removeEventListener('pointerup', onPointerUp);
      domEl.removeEventListener('webglcontextlost', onContextLost);
      controls.dispose();
      bookCtrl.dispose();
      shadowTex.dispose();
      bumpTex.dispose();
      envTex.dispose();
      renderer.dispose();
    };
  }, [book, webglSupported, reducedMotion]);

  // Swap between Book Mode & Interactive 3D Object Mode inside the same WebGL Studio Stage
  useEffect(() => {
    const bookCtrl = bookCtrlRef.current;
    const holder = interactiveObjGroupRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!bookCtrl || !holder || !camera || !controls) return;

    let cancelled = false;
    if (activeObjectMode && interactiveObjectConfig) {
      bookCtrl.root.visible = false;
      holder.visible = true;
      holder.clear();

      loadInteractiveObject3D(
        interactiveObjectConfig.proceduralType,
        interactiveObjectConfig.glbModelUrl
      ).then((group) => {
        if (!cancelled) {
          holder.clear();
          holder.add(group);
        }
      });

      gsap.to(camera.position, {
        x: 0.9,
        y: 0.75,
        z: 2.9,
        duration: reducedMotion ? 0.05 : 0.7,
        ease: 'power2.out',
      });
      gsap.to(controls.target, {
        x: 0,
        y: 0.15,
        z: 0,
        duration: reducedMotion ? 0.05 : 0.7,
      });
    } else {
      holder.visible = false;
      bookCtrl.root.visible = true;
      gsap.to(controls.target, {
        x: 0,
        y: 0,
        z: 0,
        duration: reducedMotion ? 0.05 : 0.5,
      });
    }

    return () => {
      cancelled = true;
    };
  }, [activeObjectMode, interactiveObjectConfig, reducedMotion]);

  // Procedural Short Video Story Reel Renderer (Zero 404s; supports custom .mp4 when provided)
  useEffect(() => {
    if (!showVideoModal || !interactiveObjectConfig || interactiveObjectConfig.videoUrl) return;
    const canvas = videoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let start = performance.now();

    const drawFrame = (now: number) => {
      const t = videoPlaying ? (now - start) / 1000 : 1.2;
      const w = canvas.width;
      const h = canvas.height;

      // Warm dark editorial studio frame
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#203B30');
      grad.addColorStop(0.55, '#2C221E');
      grad.addColorStop(1, '#4A362C');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      // Animated soft golden aura
      const auraX = w * 0.5 + Math.sin(t * 0.7) * 45;
      const auraY = h * 0.45 + Math.cos(t * 0.5) * 18;
      const aura = ctx.createRadialGradient(auraX, auraY, 15, auraX, auraY, 220);
      aura.addColorStop(0, 'rgba(231, 194, 192, 0.34)');
      aura.addColorStop(0.6, 'rgba(201, 149, 149, 0.12)');
      aura.addColorStop(1, 'rgba(32, 59, 48, 0)');
      ctx.fillStyle = aura;
      ctx.fillRect(0, 0, w, h);

      // Animated turning page silhouette
      ctx.save();
      ctx.translate(w / 2, h * 0.48);
      for (let p = -2; p <= 2; p++) {
        const ang = Math.sin(t * 1.1 + p * 0.45) * 0.25 + p * 0.22;
        ctx.save();
        ctx.rotate(ang * 0.35);
        ctx.strokeStyle = 'rgba(248, 244, 239, 0.38)';
        ctx.fillStyle = 'rgba(248, 244, 239, 0.08)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.rect(-75, -95, 150, 190);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();

      // Editorial titles
      ctx.fillStyle = '#E7C2C0';
      ctx.textAlign = 'center';
      ctx.font = '600 13px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('NJ STUDIO · STORY REEL', w / 2, 58);

      ctx.fillStyle = '#F8F4EF';
      ctx.font = '500 32px "Cormorant Garamond", Georgia, serif';
      ctx.fillText(interactiveObjectConfig.title, w / 2, h - 84);

      ctx.fillStyle = 'rgba(248, 244, 239, 0.8)';
      ctx.font = '400 14px "Plus Jakarta Sans", sans-serif';
      ctx.fillText(interactiveObjectConfig.videoSummary.slice(0, 74), w / 2, h - 52);

      // Progress bar
      const progress = (t % 8) / 8;
      ctx.fillStyle = 'rgba(248, 244, 239, 0.2)';
      ctx.fillRect(60, h - 22, w - 120, 3);
      ctx.fillStyle = '#E7C2C0';
      ctx.fillRect(60, h - 22, (w - 120) * progress, 3);

      if (videoPlaying) {
        raf = requestAnimationFrame(drawFrame);
      }
    };

    raf = requestAnimationFrame(drawFrame);
    return () => cancelAnimationFrame(raf);
  }, [showVideoModal, interactiveObjectConfig, videoPlaying]);

  if (!book) return null;

  const animateCameraPreset = (preset: CameraViewPreset) => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    const ctrl = bookCtrlRef.current;
    if (!camera || !controls || !ctrl) return;

    setActiveObjectMode(false);

    if (preset === 'open' && !isOpen) {
      handleToggleOpen(true);
    } else if (preset !== 'open' && isOpen) {
      handleToggleOpen(false);
    }

    const targets: Record<CameraViewPreset, { x: number; y: number; z: number }> = {
      front: { x: 0.2, y: 0.15, z: 4.15 },
      spine: { x: -3.6, y: 0.2, z: 1.4 },
      back: { x: -0.25, y: 0.15, z: -4.15 },
      open: { x: 0, y: 0.2, z: 4.85 },
    };
    const t = targets[preset];
    gsap.to(camera.position, {
      x: t.x,
      y: t.y,
      z: t.z,
      duration: reducedMotion ? 0.05 : 0.85,
      ease: 'power3.out',
    });
    gsap.to(controls.target, {
      x: 0,
      y: 0,
      z: 0,
      duration: reducedMotion ? 0.05 : 0.85,
    });
  };

  const handleToggleOpen = (forceState?: boolean) => {
    const nextOpen = typeof forceState === 'boolean' ? forceState : !isOpen;
    setIsOpen(nextOpen);
    setActiveObjectMode(false);
    const ctrl = bookCtrlRef.current;
    const camera = cameraRef.current;
    if (!ctrl) return;

    gsap.to(openStateRef.current, {
      value: nextOpen ? 1 : 0,
      duration: reducedMotion ? 0.05 : 0.95,
      ease: 'power3.inOut',
      onUpdate: () => {
        ctrl.setOpenAmount(openStateRef.current.value);
      },
    });

    if (camera) {
      gsap.to(camera.position, {
        x: nextOpen ? 0 : 0.35,
        y: nextOpen ? 0.18 : 0.28,
        z: nextOpen ? 4.85 : 4.35,
        duration: reducedMotion ? 0.05 : 0.9,
        ease: 'power2.out',
      });
    }
  };

  const handleTurnPage = (dir: 1 | -1, targetIdx?: number) => {
    const ctrl = bookCtrlRef.current;
    if (!ctrl || isTurningRef.current) return;
    if (!isOpen) {
      handleToggleOpen(true);
    }
    const total = book.spreads.length;
    const nextIdx =
      typeof targetIdx === 'number'
        ? targetIdx
        : (spreadIndex + dir + total) % total;
    if (nextIdx === spreadIndex && typeof targetIdx === 'number') return;

    isTurningRef.current = true;
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
        isTurningRef.current = false;
      },
    });
  };

  const handleZoom = (factor: number) => {
    const camera = cameraRef.current;
    if (!camera) return;
    const newPos = camera.position.clone().multiplyScalar(factor);
    const dist = newPos.length();
    if (dist < 2.1 || dist > 7.2) return;
    gsap.to(camera.position, {
      x: newPos.x,
      y: newPos.y,
      z: newPos.z,
      duration: 0.35,
      ease: 'power2.out',
    });
  };

  const handleScrollThroughBook = (e: React.WheelEvent<HTMLDivElement>) => {
    // Allow scrolling through chapters inside the reading rail to turn pages in 3D
    if (Math.abs(e.deltaY) > 36 && !isTurningRef.current && book.spreads.length > 1) {
      if (e.deltaY > 0 && spreadIndex < book.spreads.length - 1) {
        handleTurnPage(1, spreadIndex + 1);
      } else if (e.deltaY < 0 && spreadIndex > 0) {
        handleTurnPage(-1, spreadIndex - 1);
      }
    }
  };

  const renderPageFallbackText = (page: BookPageContent) => (
    <div className="p-4 rounded-md bg-[#F8F4EF] border border-[#765A4A]/15">
      <div className="text-[11px] font-medium tracking-wider text-[#765A4A]">
        {page.runningHeader} · p.{page.pageNumber}
      </div>
      {page.heading && (
        <h4 className="font-serif text-xl font-semibold text-[#203B30] mt-1">
          {page.heading}
        </h4>
      )}
      <p className="mt-2 text-xs text-[#3B2F2A] leading-relaxed whitespace-pre-line">
        {page.bodyLines.filter(Boolean).join('\n')}
      </p>
    </div>
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Interactive 3D Book Studio: ${book.title}`}
      className="fixed inset-0 z-50 bg-[#1F1713]/80 flex items-center justify-center p-2 sm:p-4 lg:p-6"
    >
      <div className="relative w-full max-w-[1340px] h-[94vh] max-h-[860px] bg-[#F8F4EF] border border-[#765A4A]/25 rounded-lg shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close 3D Book Studio"
          className="absolute top-3.5 right-3.5 z-40 w-10 h-10 rounded-full bg-[#F8F4EF] hover:bg-[#E7C2C0] text-[#2C221E] border border-[#765A4A]/20 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* LEFT / CENTER: 3D Interactive Viewport */}
        <div className="relative flex-1 min-h-[380px] lg:min-h-0 bg-[#F2ECE3] flex flex-col overflow-hidden">
          {/* Minimal Top Viewport Info Bar */}
          <div className="absolute top-4 left-4 right-16 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            <div className="pointer-events-auto inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#F8F4EF]/95 border border-[#765A4A]/20 text-xs text-[#2C221E]">
              <span className="font-semibold text-[#203B30]">
                {activeObjectMode ? '3D Page Object Inspector' : '3D Book Studio'}
              </span>
              <span aria-hidden="true" className="text-[#765A4A]">·</span>
              <span className="text-[#765A4A]">
                {activeObjectMode
                  ? 'Drag to rotate 360°'
                  : isOpen
                    ? `Spread ${spreadIndex + 1} of ${book.spreads.length}`
                    : 'Drag to orbit · Scroll to zoom'}
              </span>
            </div>

            {activeObjectMode && (
              <button
                type="button"
                onClick={() => setActiveObjectMode(false)}
                className="pointer-events-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#203B30] hover:bg-[#2C221E] text-[#F8F4EF] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Return to Open Book</span>
              </button>
            )}
          </div>

          {/* Interactive Hotspot Hover Cue */}
          {hotspotHovered && !activeObjectMode && interactiveObjectConfig && (
            <div className="pointer-events-none absolute top-16 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-md bg-[#203B30] text-[#F8F4EF] text-xs font-medium shadow-md">
              Click illustration to inspect: {interactiveObjectConfig.title}
            </div>
          )}

          {/* WebGL Canvas Container */}
          {webglSupported ? (
            <div ref={mountRef} className="w-full h-full flex-1" />
          ) : (
            <div className="flex-1 p-6 overflow-y-auto flex flex-col justify-center gap-4">
              <div className="text-center text-xs text-[#765A4A]">
                WebGL is unavailable in this browser — showing interactive editorial page preview.
              </div>
              {currentSpread && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {renderPageFallbackText(currentSpread.leftPage)}
                  {renderPageFallbackText(currentSpread.rightPage)}
                </div>
              )}
            </div>
          )}

          {/* Interactive Page Object Banner (when open on a page with a 3D object) */}
          {isOpen && interactiveObjectConfig && !activeObjectMode && !dockCollapsed && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex flex-wrap items-center justify-center gap-2 px-3 py-2 rounded-md bg-[#F8F4EF]/95 border border-[#765A4A]/25 shadow-md">
              <span className="text-xs font-medium text-[#203B30] whitespace-nowrap">
                Interactive Page Artifact:
              </span>
              <button
                type="button"
                onClick={() => setActiveObjectMode(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#203B30] hover:bg-[#2C221E] text-[#F8F4EF] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <Cuboid className="w-3.5 h-3.5" />
                <span>Open 3D {interactiveObjectConfig.title.split(' ')[0]}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setVideoPlaying(true);
                  setShowVideoModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-[#E7C2C0]/60 hover:bg-[#C99595] text-[#2C221E] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
              >
                <Film className="w-3.5 h-3.5" />
                <span>Play Story Video</span>
              </button>
            </div>
          )}

          {/* Collapsible Bottom Control Dock (Zero Viewport Occlusion) */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center max-w-[96%]">
            <button
              type="button"
              onClick={() => setDockCollapsed((v) => !v)}
              className="mb-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-t-md bg-[#F8F4EF]/95 border border-b-0 border-[#765A4A]/20 text-[11px] font-medium text-[#765A4A] hover:text-[#203B30] cursor-pointer whitespace-nowrap"
            >
              {dockCollapsed ? (
                <>
                  <ChevronUp className="w-3 h-3" />
                  <span>Show Controls</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" />
                  <span>Hide Controls</span>
                </>
              )}
            </button>

            {!dockCollapsed && (
              <div className="flex flex-wrap items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-[#F8F4EF]/95 border border-[#765A4A]/25 shadow-lg">
                <button
                  type="button"
                  onClick={() => handleToggleOpen()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#203B30] hover:bg-[#2C221E] text-[#F8F4EF] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{isOpen ? 'Close Book' : 'Open Book'}</span>
                </button>

                <div className="h-4 w-px bg-[#765A4A]/20 mx-0.5 hidden sm:block" />

                <button
                  type="button"
                  onClick={() => handleTurnPage(-1)}
                  aria-label="Previous page"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-[#EFE8DE] hover:bg-[#E7C2C0]/50 text-[#2C221E] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Prev</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTurnPage(1)}
                  aria-label="Next page"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-sm bg-[#EFE8DE] hover:bg-[#E7C2C0]/50 text-[#2C221E] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-[#765A4A]/20 mx-0.5 hidden sm:block" />

                <button
                  type="button"
                  onClick={() => animateCameraPreset('front')}
                  className="px-2.5 py-1.5 rounded-sm hover:bg-[#EFE8DE] text-[#2C221E] text-xs font-medium cursor-pointer whitespace-nowrap"
                >
                  Front
                </button>
                <button
                  type="button"
                  onClick={() => animateCameraPreset('spine')}
                  className="px-2.5 py-1.5 rounded-sm hover:bg-[#EFE8DE] text-[#2C221E] text-xs font-medium cursor-pointer whitespace-nowrap"
                >
                  Spine
                </button>
                <button
                  type="button"
                  onClick={() => animateCameraPreset('back')}
                  className="px-2.5 py-1.5 rounded-sm hover:bg-[#EFE8DE] text-[#2C221E] text-xs font-medium cursor-pointer whitespace-nowrap"
                >
                  Back
                </button>

                <div className="h-4 w-px bg-[#765A4A]/20 mx-0.5 hidden sm:block" />

                <button
                  type="button"
                  onClick={() => handleZoom(0.84)}
                  aria-label="Zoom in"
                  className="p-1.5 rounded-sm hover:bg-[#EFE8DE] text-[#2C221E] cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleZoom(1.18)}
                  aria-label="Zoom out"
                  className="p-1.5 rounded-sm hover:bg-[#EFE8DE] text-[#2C221E] cursor-pointer"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => animateCameraPreset(isOpen ? 'open' : 'front')}
                  aria-label="Reset camera view"
                  className="p-1.5 rounded-sm hover:bg-[#EFE8DE] text-[#2C221E] cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Contiguous Product, Interactive Spread & Editions Panel */}
        <aside
          onWheel={handleScrollThroughBook}
          className="w-full lg:w-[430px] xl:w-[460px] shrink-0 bg-[#F8F4EF] border-t lg:border-t-0 lg:border-l border-[#765A4A]/15 overflow-y-auto p-6 lg:p-7 flex flex-col gap-5"
        >
          {/* Breadcrumb Metadata (Zero-pill clean inline typography) */}
          <div className="flex items-center justify-between gap-2 pr-8">
            <div className="flex items-center gap-2 text-xs text-[#765A4A]">
              <span>{book.categoryLabel}</span>
              <span aria-hidden="true">·</span>
              <span>{book.subcategoryLabel}</span>
            </div>
            <button
              type="button"
              onClick={() => onToggleSave(book.id)}
              aria-label={isSaved ? 'Remove from saved reading list' : 'Save to reading list'}
              className={`inline-flex items-center gap-1 text-xs font-medium cursor-pointer transition-colors ${
                isSaved ? 'text-[#203B30]' : 'text-[#765A4A] hover:text-[#203B30]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#C99595] text-[#C99595]' : ''}`} />
              <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Title & Synopsis */}
          <div>
            <h2 className="font-serif text-3xl font-semibold text-[#203B30] leading-tight">
              {book.title}
            </h2>
            <p className="font-serif italic text-base text-[#765A4A] mt-0.5">
              {book.subtitle} · {book.author}
            </p>
            <p className="mt-3 text-sm text-[#3B2F2A] leading-relaxed">
              {book.editorialDescription}
            </p>
            {book.coverTheme.isPlaceholderArtwork && (
              <p className="mt-2 text-[11px] text-[#765A4A]">
                Artwork status: {book.coverTheme.placeholderLabel}
              </p>
            )}
          </div>

          {/* Interactive Chapters & Scroll-Through-Book Index */}
          <div className="border-t border-b border-[#765A4A]/15 py-4">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#765A4A]">
                Inside This Book (Scroll or Click)
              </span>
              <span className="text-xs text-[#765A4A] tabular-nums">
                {spreadIndex + 1} / {book.spreads.length}
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {book.spreads.map((sp, i) => {
                const active = i === spreadIndex && isOpen;
                return (
                  <button
                    key={sp.spreadIndex}
                    type="button"
                    onClick={() => handleTurnPage(i >= spreadIndex ? 1 : -1, i)}
                    className={`w-full text-left px-3 py-2 rounded-sm text-xs transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                      active
                        ? 'bg-[#203B30] text-[#F8F4EF]'
                        : 'bg-[#EFE8DE]/70 hover:bg-[#E7C2C0]/40 text-[#2C221E]'
                    }`}
                  >
                    <span className="truncate font-medium">{sp.label}</span>
                    <span className="shrink-0 opacity-75 tabular-nums">
                      p.{sp.leftPage.pageNumber}–{sp.rightPage.pageNumber}
                    </span>
                  </button>
                );
              })}
            </div>

            {interactiveObjectConfig && (
              <div className="mt-3 p-3 rounded-sm bg-[#EFE8DE] border border-[#765A4A]/15">
                <div className="text-xs font-semibold text-[#203B30]">
                  {interactiveObjectConfig.title}
                </div>
                <p className="text-xs text-[#3B2F2A] mt-1 leading-relaxed">
                  {interactiveObjectConfig.description}
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveObjectMode((v) => !v)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#203B30] hover:bg-[#2C221E] text-[#F8F4EF] text-xs font-medium cursor-pointer"
                  >
                    <Cuboid className="w-3.5 h-3.5" />
                    <span>{activeObjectMode ? 'View Book' : 'Inspect 3D Object'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoPlaying(true);
                      setShowVideoModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#F8F4EF] hover:bg-[#E7C2C0]/60 text-[#2C221E] border border-[#765A4A]/25 text-xs font-medium cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Watch Short Reel</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Physical & Digital Editions Switcher */}
          <div>
            <div className="grid grid-cols-2 gap-1 p-1 rounded-md bg-[#EFE8DE] border border-[#765A4A]/15">
              <button
                type="button"
                onClick={() => setSelectedEdition('physical')}
                className={`py-2 px-3 rounded-sm text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedEdition === 'physical'
                    ? 'bg-[#F8F4EF] text-[#203B30] shadow-xs'
                    : 'text-[#765A4A] hover:text-[#2C221E]'
                }`}
              >
                Physical Edition
              </button>
              <button
                type="button"
                onClick={() => setSelectedEdition('digital')}
                className={`py-2 px-3 rounded-sm text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  selectedEdition === 'digital'
                    ? 'bg-[#F8F4EF] text-[#203B30] shadow-xs'
                    : 'text-[#765A4A] hover:text-[#2C221E]'
                }`}
              >
                Digital Edition
              </button>
            </div>

            {selectedEdition === 'physical' ? (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-[#2C221E]">
                    {book.physicalEdition.binding}
                  </span>
                  <span className="font-serif text-2xl font-semibold text-[#203B30] tabular-nums">
                    {book.physicalEdition.priceDisplay}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs border-t border-b border-[#765A4A]/15 py-3">
                  <div>
                    <dt className="text-[#765A4A]">Page Count</dt>
                    <dd className="font-medium text-[#2C221E] tabular-nums">
                      {book.physicalEdition.pageCount} pages
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#765A4A]">Dimensions</dt>
                    <dd className="font-medium text-[#2C221E] tabular-nums">
                      {book.physicalEdition.dimensions}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#765A4A]">Paper Stock</dt>
                    <dd className="font-medium text-[#2C221E]">
                      {book.physicalEdition.paperStock}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#765A4A]">ISBN</dt>
                    <dd className="font-medium text-[#2C221E] tabular-nums">
                      {book.physicalEdition.isbn}
                    </dd>
                  </div>
                </dl>

                <p className="text-xs text-[#765A4A] leading-relaxed">
                  {book.physicalEdition.fulfillmentNote}
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 mt-1">
                  <a
                    href={book.physicalEdition.marketplaceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-[#203B30] hover:bg-[#2C221E] text-[#F8F4EF] text-xs font-semibold tracking-wide transition-colors whitespace-nowrap"
                  >
                    <span>{book.physicalEdition.marketplaceLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => onAddToBag(book, 'physical')}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-sm bg-[#EFE8DE] hover:bg-[#E7C2C0]/60 text-[#2C221E] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Save to Bag</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-medium text-[#2C221E]">
                    {book.digitalEdition.format}
                  </span>
                  <span className="font-serif text-2xl font-semibold text-[#203B30] tabular-nums">
                    {book.digitalEdition.priceDisplay}
                  </span>
                </div>

                <dl className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs border-t border-b border-[#765A4A]/15 py-3">
                  <div>
                    <dt className="text-[#765A4A]">File Size</dt>
                    <dd className="font-medium text-[#2C221E] tabular-nums">
                      {book.digitalEdition.fileSize}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[#765A4A]">Compatibility</dt>
                    <dd className="font-medium text-[#2C221E]">
                      {book.digitalEdition.compatibility}
                    </dd>
                  </div>
                </dl>

                <p className="text-xs text-[#765A4A] leading-relaxed">
                  {book.digitalEdition.sampleNote}
                </p>

                <div className="flex flex-col sm:flex-row gap-2.5 mt-1">
                  <a
                    href={book.digitalEdition.purchaseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-sm bg-[#203B30] hover:bg-[#2C221E] text-[#F8F4EF] text-xs font-semibold tracking-wide transition-colors whitespace-nowrap"
                  >
                    <span>{book.digitalEdition.marketplaceLabel}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleToggleOpen(true)}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-sm bg-[#EFE8DE] hover:bg-[#E7C2C0]/60 text-[#2C221E] text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview Pages</span>
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onAddToBag(book, 'digital')}
                  className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-sm border border-[#765A4A]/30 hover:bg-[#EFE8DE] text-[#2C221E] text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Add Digital Edition to Bag</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Nested Story Video Reel Overlay */}
        {showVideoModal && interactiveObjectConfig && (
          <div className="absolute inset-0 z-50 bg-[#1B1410]/95 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-2xl bg-[#241B16] border border-[#F8F4EF]/15 rounded-lg overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-5 py-3 border-b border-[#F8F4EF]/10">
                <div className="text-sm font-medium text-[#F8F4EF]">
                  {interactiveObjectConfig.title} · Short Story Reel
                </div>
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  aria-label="Close video preview"
                  className="p-1.5 rounded-full hover:bg-[#F8F4EF]/10 text-[#F8F4EF] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {interactiveObjectConfig.videoUrl ? (
                <video
                  src={interactiveObjectConfig.videoUrl}
                  controls
                  autoPlay
                  className="w-full aspect-video bg-black"
                />
              ) : (
                <div className="relative aspect-video bg-[#203B30]">
                  <canvas
                    ref={videoCanvasRef}
                    width={720}
                    height={405}
                    className="w-full h-full block"
                  />
                  <button
                    type="button"
                    onClick={() => setVideoPlaying((p) => !p)}
                    className="absolute bottom-5 left-5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-[#F8F4EF] text-[#203B30] text-xs font-semibold cursor-pointer"
                  >
                    {videoPlaying ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause Reel</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Play Reel</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
