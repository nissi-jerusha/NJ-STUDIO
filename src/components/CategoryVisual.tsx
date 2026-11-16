import React from 'react';
import type { PrimaryCategoryId } from '../data/catalogue';

interface CategoryVisualProps {
  categoryId: PrimaryCategoryId;
}

export const CategoryVisual: React.FC<CategoryVisualProps> = ({ categoryId }) => {
  if (categoryId === 'mystery-discovery') {
    return (
      <svg
        viewBox="0 0 320 260"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="mapBg" cx="50%" cy="45%" r="65%">
            <stop offset="0%" stopColor="#EFE4D2" />
            <stop offset="100%" stopColor="#C8B296" />
          </radialGradient>
        </defs>
        <rect width="320" height="260" fill="url(#mapBg)" />
        {/* Vintage cartography lines */}
        <path
          d="M25,65 Q110,30 180,85 T300,60 M15,175 Q95,140 190,195 T310,165"
          fill="none"
          stroke="#765A4A"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          opacity="0.45"
        />
        <circle cx="80" cy="110" r="38" fill="none" stroke="#765A4A" strokeWidth="1" opacity="0.28" />
        {/* Brass Compass top right */}
        <g transform="translate(248, 62)">
          <circle cx="0" cy="0" r="32" fill="#D5B47C" stroke="#765A4A" strokeWidth="2.5" />
          <circle cx="0" cy="0" r="25" fill="#F8F4EF" stroke="#765A4A" strokeWidth="1.2" />
          <polygon points="0,-19 5,0 0,19 -5,0" fill="#203B30" />
          <polygon points="0,-19 5,0 -5,0" fill="#C99595" />
        </g>
        {/* Magnifying Glass */}
        <g transform="translate(132, 128) rotate(-28)">
          <rect x="-7" y="54" width="14" height="68" rx="6" fill="#5D4234" stroke="#3E2A20" strokeWidth="1.5" />
          <rect x="-8" y="46" width="16" height="10" rx="2" fill="#C9A66B" />
          <circle cx="0" cy="0" r="54" fill="#E7F0EE" fillOpacity="0.42" stroke="#B79256" strokeWidth="7" />
          <circle cx="0" cy="0" r="47" fill="none" stroke="#F8F4EF" strokeWidth="1.5" opacity="0.7" />
          <path d="M-24,-22 Q-8,-35 16,-28" fill="none" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
        </g>
      </svg>
    );
  }

  if (categoryId === 'faith-spirituality') {
    return (
      <svg
        viewBox="0 0 320 260"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        aria-hidden="true"
      >
        <rect width="320" height="260" fill="#F2ECE4" />
        {/* Open Scripture Pages */}
        <g transform="translate(160, 146)">
          <path d="M-95,-68 Q-45,-78 0,-60 L0,64 Q-48,50 -95,62 Z" fill="#FBF8F3" stroke="#92977B" strokeWidth="1.6" />
          <path d="M95,-68 Q45,-78 0,-60 L0,64 Q48,50 95,62 Z" fill="#F6F1E8" stroke="#92977B" strokeWidth="1.6" />
          <line x1="-74" y1="-34" x2="-20" y2="-30" stroke="#C8BEB3" strokeWidth="2" />
          <line x1="-74" y1="-16" x2="-20" y2="-12" stroke="#C8BEB3" strokeWidth="2" />
          <line x1="20" y1="-30" x2="74" y2="-34" stroke="#C8BEB3" strokeWidth="2" />
          <line x1="20" y1="-12" x2="74" y2="-16" stroke="#C8BEB3" strokeWidth="2" />
        </g>
        {/* Olive / Sage Branches */}
        <g stroke="#203B30" strokeWidth="1.6" fill="#92977B" opacity="0.88">
          <path d="M62,215 Q102,145 148,80" fill="none" strokeWidth="2.2" />
          <ellipse cx="95" cy="175" rx="14" ry="7" transform="rotate(-35 95 175)" />
          <ellipse cx="118" cy="142" rx="14" ry="7" transform="rotate(20 118 142)" />
          <ellipse cx="136" cy="112" rx="12" ry="6" transform="rotate(-30 136 112)" />
          <path d="M258,215 Q218,145 172,80" fill="none" strokeWidth="2.2" />
          <ellipse cx="225" cy="175" rx="14" ry="7" transform="rotate(35 225 175)" />
          <ellipse cx="202" cy="142" rx="14" ry="7" transform="rotate(-20 202 142)" />
        </g>
        {/* Carved Walnut Cross */}
        <g transform="translate(160, 128)">
          <rect x="-12" y="-76" width="24" height="154" rx="3" fill="#765A4A" stroke="#4D392E" strokeWidth="1.6" />
          <rect x="-54" y="-42" width="108" height="22" rx="3" fill="#765A4A" stroke="#4D392E" strokeWidth="1.6" />
          <rect x="-8" y="-72" width="6" height="146" fill="#8C6D5A" opacity="0.5" />
        </g>
      </svg>
    );
  }

  if (categoryId === 'notes-journals') {
    return (
      <svg
        viewBox="0 0 320 260"
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        aria-hidden="true"
      >
        <rect width="320" height="260" fill="#DFD4C5" />
        {/* Warm Desk Wood Grain */}
        <line x1="0" y1="64" x2="320" y2="64" stroke="#CBBBA8" strokeWidth="1.2" />
        <line x1="0" y1="198" x2="320" y2="198" stroke="#CBBBA8" strokeWidth="1.2" />
        {/* Stitched Leather Journal */}
        <g transform="translate(160, 130) rotate(-6)">
          <rect x="-74" y="-92" width="148" height="184" rx="10" fill="#765A4A" stroke="#4F3A2F" strokeWidth="2" />
          <rect x="-66" y="-84" width="132" height="168" rx="6" fill="none" stroke="#B7926A" strokeWidth="1.2" strokeDasharray="4 3" />
          {/* Elastic closure strap */}
          <rect x="-76" y="-8" width="152" height="16" fill="#2C221E" />
          {/* Fountain Pen resting across journal */}
          <g transform="translate(8, -4) rotate(32)">
            <rect x="-6" y="-72" width="12" height="122" rx="4" fill="#203B30" stroke="#13241D" strokeWidth="1" />
            <rect x="-6" y="-12" width="12" height="8" fill="#D5B47C" />
            <polygon points="-5,50 5,50 0,72" fill="#D5B47C" />
          </g>
        </g>
      </svg>
    );
  }

  // stories-inspiration
  return (
    <svg
      viewBox="0 0 320 260"
      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      aria-hidden="true"
    >
      <rect width="320" height="260" fill="#F8F4EF" />
      {/* Whimsical Ink Ribbon */}
      <path
        d="M52,195 C90,140 165,210 212,135 C245,84 195,48 164,84"
        fill="none"
        stroke="#2C221E"
        strokeWidth="1.8"
      />
      {/* Sage Quill Feather */}
      <g transform="translate(162, 118) rotate(28)">
        <path
          d="M0,-82 C28,-54 32,12 0,68 C-26,18 -24,-52 0,-82 Z"
          fill="#92977B"
          stroke="#203B30"
          strokeWidth="1.8"
        />
        <line x1="0" y1="-78" x2="0" y2="96" stroke="#203B30" strokeWidth="2.2" />
      </g>
      {/* Editorial Story Vignette Medallions */}
      <circle cx="78" cy="78" r="24" fill="#E7C2C0" stroke="#765A4A" strokeWidth="1.5" />
      <circle cx="78" cy="74" r="7" fill="#765A4A" />
      <path d="M66,94 Q78,82 90,94" fill="#203B30" />
      <circle cx="248" cy="186" r="20" fill="#EFE4D2" stroke="#765A4A" strokeWidth="1.5" />
      <polygon points="248,174 256,192 240,192" fill="#C99595" />
    </svg>
  );
};
