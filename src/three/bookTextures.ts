import * as THREE from 'three';
import type { BookPageContent, BookProduct } from '../data/catalogue';

const TEXTURE_CACHE = new Map<string, THREE.Texture>();

function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function drawPlaceholderCoverFrame(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  book: BookProduct
) {
  const { coverColor, textColor, accentColor, foilColor, isPlaceholderArtwork, placeholderLabel } =
    book.coverTheme;

  // Base cover tone
  ctx.fillStyle = coverColor;
  ctx.fillRect(0, 0, w, h);

  // Subtle paper fiber grain
  ctx.fillStyle = 'rgba(0,0,0,0.025)';
  for (let i = 0; i < 900; i++) {
    const gx = ((i * 73) % w);
    const gy = ((i * 137) % h);
    ctx.fillRect(gx, gy, 2, 1);
  }

  // Spine crease shadow on left edge
  const creaseGrad = ctx.createLinearGradient(0, 0, w * 0.08, 0);
  creaseGrad.addColorStop(0, 'rgba(0,0,0,0.18)');
  creaseGrad.addColorStop(0.5, 'rgba(0,0,0,0.04)');
  creaseGrad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = creaseGrad;
  ctx.fillRect(0, 0, w * 0.08, h);

  // Hairline editorial border frame
  ctx.strokeStyle = foilColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(46, 46, w - 92, h - 92);

  ctx.strokeStyle = accentColor;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = 1.25;
  ctx.strokeRect(58, 58, w - 116, h - 116);
  ctx.globalAlpha = 1;

  // Top imprint header
  ctx.fillStyle = textColor;
  ctx.textAlign = 'center';
  ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('NJ STUDIO', w / 2, 118);

  // Ornamental divider rule
  ctx.strokeStyle = accentColor;
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(w / 2 - 48, 142);
  ctx.lineTo(w / 2 + 48, 142);
  ctx.stroke();
  ctx.globalAlpha = 1;

  // Title block
  ctx.fillStyle = textColor;
  ctx.font = '600 58px "Cormorant Garamond", Georgia, serif';
  const titleLines = wrapTextLines(ctx, book.title, w - 180);
  let startY = h * 0.34 - (titleLines.length * 64) / 2;
  for (const line of titleLines) {
    ctx.fillText(line, w / 2, startY);
    startY += 66;
  }

  // Subtitle
  ctx.fillStyle = accentColor;
  ctx.font = 'italic 500 28px "Cormorant Garamond", Georgia, serif';
  ctx.fillText(book.subtitle, w / 2, startY + 26);

  // Center editorial motif (distinct per book category)
  const motifY = h * 0.64;
  ctx.save();
  ctx.translate(w / 2, motifY);
  ctx.strokeStyle = textColor;
  ctx.fillStyle = accentColor;
  ctx.lineWidth = 2.2;

  if (book.categoryId === 'notes-journals') {
    // Minimalist botanical leaf + nib emblem
    ctx.beginPath();
    ctx.ellipse(0, 0, 56, 76, 0, 0, Math.PI * 2);
    ctx.globalAlpha = 0.14;
    ctx.fill();
    ctx.globalAlpha = 0.7;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, -48);
    ctx.lineTo(0, 48);
    ctx.moveTo(0, -10);
    ctx.quadraticCurveTo(28, -28, 32, -4);
    ctx.moveTo(0, 12);
    ctx.quadraticCurveTo(-28, -6, -32, 18);
    ctx.stroke();
  } else if (book.categoryId === 'mystery-discovery') {
    // Keyhole & compass emblem
    ctx.beginPath();
    ctx.arc(0, -14, 48, 0, Math.PI * 2);
    ctx.globalAlpha = 0.14;
    ctx.fill();
    ctx.globalAlpha = 0.78;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -18, 16, 0, Math.PI * 2);
    ctx.moveTo(-8, -4);
    ctx.lineTo(-14, 34);
    ctx.lineTo(14, 34);
    ctx.lineTo(8, -4);
    ctx.stroke();
  } else if (book.categoryId === 'faith-spirituality') {
    // Stylized wooden boat / olive branch horizon emblem
    ctx.beginPath();
    ctx.arc(0, -6, 62, 0, Math.PI * 2);
    ctx.globalAlpha = 0.14;
    ctx.fill();
    ctx.globalAlpha = 0.85;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-42, 8);
    ctx.quadraticCurveTo(0, 38, 42, 8);
    ctx.lineTo(30, -8);
    ctx.lineTo(-30, -8);
    ctx.closePath();
    ctx.stroke();
    ctx.strokeRect(-14, -28, 28, 20);
  } else {
    // Story lantern / folded wing motif
    ctx.beginPath();
    ctx.moveTo(0, -56);
    ctx.lineTo(44, 0);
    ctx.lineTo(0, 56);
    ctx.lineTo(-44, 0);
    ctx.closePath();
    ctx.globalAlpha = 0.16;
    ctx.fill();
    ctx.globalAlpha = 0.85;
    ctx.stroke();
  }
  ctx.restore();

  // Clear Placeholder Artwork Badge (only when real cover artwork is not supplied)
  if (isPlaceholderArtwork) {
    ctx.save();
    ctx.fillStyle = 'rgba(32, 59, 48, 0.09)';
    ctx.strokeStyle = 'rgba(32, 59, 48, 0.25)';
    ctx.lineWidth = 1;
    const badgeW = w - 190;
    const badgeH = 38;
    const bx = (w - badgeW) / 2;
    const by = h - 188;
    ctx.fillRect(bx, by, badgeW, badgeH);
    ctx.strokeRect(bx, by, badgeW, badgeH);

    ctx.fillStyle = textColor;
    ctx.globalAlpha = 0.72;
    ctx.font = '500 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(placeholderLabel, w / 2, by + 24);
    ctx.restore();
  }

  // Bottom publisher colophon
  ctx.fillStyle = textColor;
  ctx.globalAlpha = 0.85;
  ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('NJ STUDIO PUBLISHING', w / 2, h - 98);
  ctx.globalAlpha = 1;
}

export function createFrontCoverTexture(
  book: BookProduct,
  maxAnisotropy = 4
): THREE.Texture {
  const key = `front:${book.id}:${book.coverTheme.frontCoverImageUrl || 'proc'}`;
  if (TEXTURE_CACHE.has(key)) return TEXTURE_CACHE.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    drawPlaceholderCoverFrame(ctx, canvas.width, canvas.height, book);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;

  // If custom cover image path is supplied, load and overlay preserving aspect ratio
  if (book.coverTheme.frontCoverImageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (ctx) {
        ctx.fillStyle = book.coverTheme.coverColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const crop = book.coverTheme.coverCropMargins;
        const sx = crop ? img.naturalWidth * crop.left : 0;
        const sy = crop ? img.naturalHeight * crop.top : 0;
        const sw = crop ? img.naturalWidth * (1 - crop.left - crop.right) : img.naturalWidth;
        const sh = crop ? img.naturalHeight * (1 - crop.top - crop.bottom) : img.naturalHeight;

        const scale = Math.min(canvas.width / sw, canvas.height / sh);
        const dw = sw * scale;
        const dh = sh * scale;
        const dx = (canvas.width - dw) / 2;
        const dy = (canvas.height - dh) / 2;
        ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        texture.needsUpdate = true;
      }
    };
    img.src = book.coverTheme.frontCoverImageUrl;
  }

  TEXTURE_CACHE.set(key, texture);
  return texture;
}

export function createBackCoverTexture(
  book: BookProduct,
  maxAnisotropy = 4
): THREE.Texture {
  const key = `back:${book.id}:${book.coverTheme.backCoverImageUrl || 'proc'}`;
  if (TEXTURE_CACHE.has(key)) return TEXTURE_CACHE.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const { backColor, textColor, accentColor, foilColor } = book.coverTheme;
    ctx.fillStyle = backColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle right spine hinge shadow
    const grad = ctx.createLinearGradient(canvas.width * 0.92, 0, canvas.width, 0);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(0,0,0,0.2)');
    ctx.fillStyle = grad;
    ctx.fillRect(canvas.width * 0.92, 0, canvas.width * 0.08, canvas.height);

    ctx.strokeStyle = foilColor;
    ctx.lineWidth = 2.5;
    ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(book.categoryLabel.toUpperCase(), canvas.width / 2, 150);

    ctx.font = '500 38px "Cormorant Garamond", Georgia, serif';
    const titleLines = wrapTextLines(ctx, book.title, canvas.width - 200);
    let ty = 220;
    for (const line of titleLines) {
      ctx.fillText(line, canvas.width / 2, ty);
      ty += 46;
    }

    ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
    ctx.globalAlpha = 0.85;
    const descLines = wrapTextLines(ctx, book.shortDescription, canvas.width - 210);
    let dy = ty + 48;
    for (const line of descLines) {
      ctx.fillText(line, canvas.width / 2, dy);
      dy += 38;
    }
    ctx.globalAlpha = 1;

    // Edition details
    ctx.fillStyle = accentColor;
    ctx.font = '500 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(
      `${book.physicalEdition.pageCount} Pages  ·  ${book.physicalEdition.dimensions}`,
      canvas.width / 2,
      canvas.height - 260
    );

    // Barcode block
    const bw = 210;
    const bh = 90;
    const bx = canvas.width / 2 - bw / 2;
    const by = canvas.height - 200;
    ctx.fillStyle = '#F8F4EF';
    ctx.fillRect(bx, by, bw, bh);
    ctx.fillStyle = '#2C221E';
    for (let x = 14; x < bw - 14; x += 6) {
      const barW = (x * 7) % 5 === 0 ? 3 : 1.5;
      ctx.fillRect(bx + x, by + 12, barW, 52);
    }
    ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`ISBN ${book.physicalEdition.isbn}`, canvas.width / 2, by + 80);

    ctx.fillStyle = textColor;
    ctx.font = '600 18px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NJ STUDIO · A Little Space for Every Story', canvas.width / 2, canvas.height - 68);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;

  if (book.coverTheme.backCoverImageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        texture.needsUpdate = true;
      }
    };
    img.src = book.coverTheme.backCoverImageUrl;
  }

  TEXTURE_CACHE.set(key, texture);
  return texture;
}

export function createSpineTexture(
  book: BookProduct,
  maxAnisotropy = 4
): THREE.Texture {
  const key = `spine:${book.id}:${book.coverTheme.spineImageUrl || 'proc'}`;
  if (TEXTURE_CACHE.has(key)) return TEXTURE_CACHE.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const { spineColor, foilColor } = book.coverTheme;
    ctx.fillStyle = spineColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle bookbinding ribs
    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (const ry of [95, 195, 830, 925]) {
      ctx.fillRect(0, ry, canvas.width, 6);
    }
    ctx.fillStyle = foilColor;
    for (const ry of [102, 202, 825, 920]) {
      ctx.fillRect(24, ry, canvas.width - 48, 2);
    }

    // Vertical spine title
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillStyle = foilColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '600 32px "Cormorant Garamond", Georgia, serif';
    const shortTitle =
      book.title.length > 34 ? `${book.title.slice(0, 32)}…` : book.title;
    ctx.fillText(shortTitle, 0, 0);
    ctx.restore();

    // Bottom imprint mark
    ctx.fillStyle = foilColor;
    ctx.textAlign = 'center';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.fillText('NJ', canvas.width / 2, canvas.height - 46);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;

  if (book.coverTheme.spineImageUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (ctx) {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        texture.needsUpdate = true;
      }
    };
    img.src = book.coverTheme.spineImageUrl;
  }

  TEXTURE_CACHE.set(key, texture);
  return texture;
}

export function createPageBlockEdgeTexture(maxAnisotropy = 4): THREE.Texture {
  const key = 'page-block-edges';
  if (TEXTURE_CACHE.has(key)) return TEXTURE_CACHE.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#EFE7DA';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let x = 0; x < canvas.width; x += 2) {
      const shade = (x % 6 === 0) ? 'rgba(118, 90, 74, 0.14)' : 'rgba(255, 252, 246, 0.45)';
      ctx.fillStyle = shade;
      ctx.fillRect(x, 0, 1, canvas.height);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  TEXTURE_CACHE.set(key, tex);
  return tex;
}

export function createSpreadPageTexture(
  book: BookProduct,
  page: BookPageContent,
  side: 'left' | 'right',
  isHighlighted = false,
  maxAnisotropy = 4
): THREE.Texture {
  const key = `page:${book.id}:${page.pageNumber}:${side}:${isHighlighted ? 'hi' : 'std'}`;
  if (TEXTURE_CACHE.has(key)) return TEXTURE_CACHE.get(key)!;

  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Warm archival cream paper
    ctx.fillStyle = '#F7F2E9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle gutter shadow near spine
    const gutterGrad =
      side === 'left'
        ? ctx.createLinearGradient(canvas.width - 70, 0, canvas.width, 0)
        : ctx.createLinearGradient(0, 0, 70, 0);
    if (side === 'left') {
      gutterGrad.addColorStop(0, 'rgba(60, 42, 30, 0)');
      gutterGrad.addColorStop(1, 'rgba(60, 42, 30, 0.14)');
      ctx.fillStyle = gutterGrad;
      ctx.fillRect(canvas.width - 70, 0, 70, canvas.height);
    } else {
      gutterGrad.addColorStop(0, 'rgba(60, 42, 30, 0.14)');
      gutterGrad.addColorStop(1, 'rgba(60, 42, 30, 0)');
      ctx.fillStyle = gutterGrad;
      ctx.fillRect(0, 0, 70, canvas.height);
    }

    // Running header
    ctx.fillStyle = '#765A4A';
    ctx.textAlign = side === 'left' ? 'left' : 'right';
    ctx.font = '600 15px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(page.runningHeader, side === 'left' ? 76 : canvas.width - 76, 84);

    // Hairline rule
    ctx.strokeStyle = 'rgba(118, 90, 74, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(76, 104);
    ctx.lineTo(canvas.width - 76, 104);
    ctx.stroke();

    // Heading
    let y = 178;
    if (page.heading) {
      ctx.fillStyle = '#203B30';
      ctx.textAlign = 'left';
      ctx.font = '600 44px "Cormorant Garamond", Georgia, serif';
      const hLines = wrapTextLines(ctx, page.heading, canvas.width - 152);
      for (const hl of hLines) {
        ctx.fillText(hl, 76, y);
        y += 50;
      }
      y += 22;
    }

    // Body prose
    ctx.fillStyle = '#3B2F2A';
    ctx.textAlign = 'left';
    ctx.font = '400 23px "Cormorant Garamond", Georgia, serif';
    for (const line of page.bodyLines) {
      if (line === '') {
        y += 22;
      } else {
        ctx.fillText(line, 76, y);
        y += 36;
      }
    }

    // Interactive Illustration Frame (lower half of page)
    if (page.illustrationStyle || page.interactiveObject) {
      const boxX = 86;
      const boxY = 530;
      const boxW = canvas.width - 172;
      const boxH = 340;

      ctx.fillStyle = isHighlighted ? 'rgba(201, 149, 149, 0.16)' : 'rgba(146, 151, 123, 0.09)';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = page.interactiveObject
        ? isHighlighted
          ? '#203B30'
          : '#765A4A'
        : 'rgba(118, 90, 74, 0.35)';
      ctx.lineWidth = page.interactiveObject ? 2.5 : 1.25;
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      // Draw crisp editorial line-art illustration inside the frame
      const cx = boxX + boxW / 2;
      const cy = boxY + boxH / 2 - 14;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.strokeStyle = '#203B30';
      ctx.fillStyle = '#C99595';
      ctx.lineWidth = 2.4;

      if (page.interactiveObject?.proceduralType === 'fountain-pen') {
        // Nib + inkwell sketch
        ctx.beginPath();
        ctx.moveTo(0, -68);
        ctx.lineTo(28, 12);
        ctx.lineTo(14, 52);
        ctx.lineTo(-14, 52);
        ctx.lineTo(-28, 12);
        ctx.closePath();
        ctx.globalAlpha = 0.22;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -68);
        ctx.lineTo(0, -8);
        ctx.arc(0, -6, 6, 0, Math.PI * 2);
        ctx.stroke();
      } else if (page.interactiveObject?.proceduralType === 'mystery-box') {
        // Isometric puzzle chest + key
        ctx.strokeRect(-72, -36, 144, 88);
        ctx.beginPath();
        ctx.moveTo(-72, -36);
        ctx.lineTo(-42, -64);
        ctx.lineTo(102, -64);
        ctx.lineTo(72, -36);
        ctx.moveTo(102, -64);
        ctx.lineTo(102, 24);
        ctx.lineTo(72, 52);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 8, 12, 0, Math.PI * 2);
        ctx.stroke();
      } else if (page.interactiveObject?.proceduralType === 'noahs-ark') {
        // Ark hull + waves + dove
        ctx.beginPath();
        ctx.moveTo(-95, 10);
        ctx.quadraticCurveTo(0, 62, 95, 10);
        ctx.lineTo(75, -18);
        ctx.lineTo(-75, -18);
        ctx.closePath();
        ctx.globalAlpha = 0.24;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();
        ctx.strokeRect(-42, -52, 84, 34);
        ctx.beginPath();
        ctx.arc(0, -76, 10, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        // Botanical / Lantern vignette
        ctx.beginPath();
        ctx.arc(0, 0, 56, 0, Math.PI * 2);
        ctx.globalAlpha = 0.16;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, -40);
        ctx.lineTo(0, 40);
        ctx.moveTo(-34, 0);
        ctx.lineTo(34, 0);
        ctx.stroke();
      }
      ctx.restore();

      if (page.illustrationCaption) {
        ctx.fillStyle = page.interactiveObject ? '#203B30' : '#765A4A';
        ctx.textAlign = 'center';
        ctx.font = page.interactiveObject
          ? '600 17px "Plus Jakarta Sans", sans-serif'
          : 'italic 500 18px "Cormorant Garamond", Georgia, serif';
        ctx.fillText(page.illustrationCaption, canvas.width / 2, boxY + boxH - 22);
      }
    }

    // Page number footer
    ctx.fillStyle = '#765A4A';
    ctx.textAlign = 'center';
    ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(String(page.pageNumber), canvas.width / 2, canvas.height - 54);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  texture.needsUpdate = true;
  TEXTURE_CACHE.set(key, texture);
  return texture;
}
