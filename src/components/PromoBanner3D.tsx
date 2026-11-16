import React, { useEffect, useRef } from 'react';

interface PromoBanner3DProps {
  onExploreCollection: () => void;
}

export const PromoBanner3D: React.FC<PromoBanner3DProps> = ({
  onExploreCollection,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    const start = performance.now();

    const drawScene = (now: number) => {
      const t = mq.matches ? 0.5 : (now - start) / 1000;
      const w = canvas.width;
      const h = canvas.height;

      // Warm dark espresso studio backdrop
      const bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#231813');
      bg.addColorStop(0.55, '#312119');
      bg.addColorStop(1, '#1B130F');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      // Warm candlelight ambient pool on the left-center
      const candle = ctx.createRadialGradient(
        w * 0.28,
        h * 0.42,
        10,
        w * 0.34,
        h * 0.48,
        w * 0.42
      );
      candle.addColorStop(0, 'rgba(255, 210, 145, 0.36)');
      candle.addColorStop(0.5, 'rgba(214, 154, 108, 0.14)');
      candle.addColorStop(1, 'rgba(35, 24, 19, 0)');
      ctx.fillStyle = candle;
      ctx.fillRect(0, 0, w, h);

      // Desk surface
      ctx.fillStyle = 'rgba(24, 16, 12, 0.65)';
      ctx.fillRect(0, h * 0.68, w, h * 0.32);

      // Stylized Open Book spread in warm illumination
      ctx.save();
      ctx.translate(w * 0.48, h * 0.62);

      // Cover boards under pages
      ctx.fillStyle = '#203B30';
      ctx.beginPath();
      ctx.moveTo(-260, 42);
      ctx.lineTo(0, 62);
      ctx.lineTo(260, 42);
      ctx.lineTo(245, -75);
      ctx.lineTo(0, -56);
      ctx.lineTo(-245, -75);
      ctx.closePath();
      ctx.fill();

      // Left open page
      const pageGradL = ctx.createLinearGradient(-230, 0, 0, 0);
      pageGradL.addColorStop(0, '#E8DEC9');
      pageGradL.addColorStop(0.85, '#F6EFE2');
      pageGradL.addColorStop(1, '#CFC1AE');
      ctx.fillStyle = pageGradL;
      ctx.beginPath();
      ctx.moveTo(-240, 32);
      ctx.quadraticCurveTo(-120, 12, 0, 46);
      ctx.lineTo(0, -68);
      ctx.quadraticCurveTo(-115, -96, -225, -72);
      ctx.closePath();
      ctx.fill();

      // Right open page
      const pageGradR = ctx.createLinearGradient(0, 0, 230, 0);
      pageGradR.addColorStop(0, '#CFC1AE');
      pageGradR.addColorStop(0.15, '#F6EFE2');
      pageGradR.addColorStop(1, '#E6D9C5');
      ctx.fillStyle = pageGradR;
      ctx.beginPath();
      ctx.moveTo(0, 46);
      ctx.quadraticCurveTo(120, 12, 240, 32);
      ctx.lineTo(225, -72);
      ctx.quadraticCurveTo(115, -96, 0, -68);
      ctx.closePath();
      ctx.fill();

      // Gently fluttering single turning leaf
      const leafAngle = Math.sin(t * 0.85) * 0.35;
      ctx.save();
      ctx.rotate(leafAngle * 0.25);
      ctx.fillStyle = 'rgba(250, 245, 236, 0.85)';
      ctx.beginPath();
      ctx.moveTo(0, 44);
      ctx.quadraticCurveTo(85, -8, 165, -22);
      ctx.lineTo(155, -108);
      ctx.quadraticCurveTo(75, -110, 0, -68);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Subtle ruled typography lines on pages
      ctx.strokeStyle = 'rgba(118, 90, 74, 0.25)';
      ctx.lineWidth = 1.5;
      for (let i = -48; i <= 6; i += 14) {
        ctx.beginPath();
        ctx.moveTo(-195, i);
        ctx.lineTo(-40, i + 4);
        ctx.stroke();
      }
      ctx.restore();

      // Warm brass fountain pen resting on right stationery margin
      ctx.save();
      ctx.translate(w * 0.78, h * 0.76);
      ctx.rotate(-0.42);
      ctx.fillStyle = '#203B30';
      ctx.fillRect(-52, -5, 84, 10);
      ctx.fillStyle = '#D2AF70';
      ctx.beginPath();
      ctx.moveTo(32, -4);
      ctx.lineTo(52, 0);
      ctx.lineTo(32, 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Drifting warm light motes
      for (let m = 0; m < 16; m++) {
        const mx = ((m * 113 + t * 14) % w);
        const my = ((m * 71 - t * 9 + h) % h);
        ctx.fillStyle = 'rgba(255, 224, 178, 0.28)';
        ctx.beginPath();
        ctx.arc(mx, my, (m % 3) + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!mq.matches) {
        raf = requestAnimationFrame(drawFrameWrapper);
      }
    };

    const drawFrameWrapper = (now: number) => drawScene(now);
    raf = requestAnimationFrame(drawFrameWrapper);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="py-6 md:py-10 bg-[#F8F4EF]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-md overflow-hidden border border-[#765A4A]/20 min-h-[300px] md:min-h-[340px] flex items-center justify-center text-center">
          <canvas
            ref={canvasRef}
            width={1200}
            height={380}
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div
            className="absolute inset-0 bg-gradient-to-t from-[#1B130F]/75 via-[#1B130F]/35 to-[#1B130F]/55"
            aria-hidden="true"
          />
          <div className="relative z-10 px-6 py-12 max-w-2xl">
            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-medium text-[#F8F4EF] leading-tight text-balance">
              Discover a World Beyond the Pages.
            </h2>
            <p className="mt-3 text-sm text-[#F8F4EF]/85 max-w-lg mx-auto">
              Every NJ STUDIO release is crafted to invite slower reading, tactile curiosity, and interactive wonder.
            </p>
            <button
              type="button"
              onClick={onExploreCollection}
              className="mt-6 px-6 py-2.5 rounded-sm bg-[#F8F4EF] hover:bg-[#E7C2C0] text-[#203B30] text-xs font-semibold tracking-wide transition-colors cursor-pointer whitespace-nowrap"
            >
              Explore the Collection
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
