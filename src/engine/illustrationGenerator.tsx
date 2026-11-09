import React, { useState } from 'react';
import { SynthesizedArtDirection } from './hybridGenerator';
import { PortfolioPhoto } from '../utils/knowledgeParser';
import { Camera, Sparkles } from 'lucide-react';

export interface IllustrationConfig {
  id: string;
  title: string;
  subject: string;
  category: SynthesizedArtDirection['illustrationCategory'];
  scaleFactor: number;
  rotationDeg: number;
  framingMode: 'integrated-portrait-sculpture' | 'pure-procedural-totem' | 'duotone-collage-cutout';
  overflowBleed: boolean;
}

export function generateIllustrationConfig(
  artDirection: SynthesizedArtDirection,
  rng: () => number
): IllustrationConfig {
  const modes: IllustrationConfig['framingMode'][] = [
    'integrated-portrait-sculpture',
    'duotone-collage-cutout',
    'pure-procedural-totem',
  ];
  // Favor integrated portrait + procedural illustration so both Shamil's photo and the style illustration shine
  const r = rng();
  const framingMode =
    r < 0.55
      ? 'integrated-portrait-sculpture'
      : r < 0.85
      ? 'duotone-collage-cutout'
      : modes[2];

  return {
    id: `illus-${artDirection.signatureId}-${Math.floor(rng() * 1000)}`,
    title: `${artDirection.name} Visual Plates`,
    subject: artDirection.illustrationSubject,
    category: artDirection.illustrationCategory,
    scaleFactor: 0.96 + rng() * 0.14,
    rotationDeg:
      artDirection.illustrationCategory === 'collage-scrapbook'
        ? (rng() - 0.5) * 6
        : 0,
    framingMode,
    overflowBleed: rng() < 0.5,
  };
}

interface ProceduralIllustrationProps {
  artDirection: SynthesizedArtDirection;
  config: IllustrationConfig;
  photo: PortfolioPhoto;
  pointer: { x: number; y: number; active: boolean };
  onCyclePhoto: () => void;
  compact?: boolean;
}

export const ProceduralIllustration: React.FC<ProceduralIllustrationProps> = ({
  artDirection,
  config,
  photo,
  pointer,
  onCyclePhoto,
  compact = false,
}) => {
  const [hovered, setHovered] = useState(false);
  const [showPureVector, setShowPureVector] = useState(false);
  const [imgError, setImgError] = useState(false);

  const px = (pointer.x - 0.5) * 22;
  const py = (pointer.y - 0.5) * 22;

  const getPhotoFilter = (): string => {
    switch (artDirection.photoTreatment) {
      case 'high-contrast-mono':
        return 'grayscale(0.9) contrast(1.22)';
      case 'warm-sepia':
        return 'sepia(0.35) contrast(1.08)';
      case 'duotone-accent':
        return 'contrast(1.15) saturate(1.25)';
      case 'halftone-frame':
        return 'contrast(1.2) saturate(1.15)';
      default:
        return 'contrast(1.04)';
    }
  };

  const renderCategoryVectorArt = () => {
    const c1 = artDirection.accentPrimary;
    const c2 = artDirection.accentSecondary;
    const fg = artDirection.textPrimary;
    const border = artDirection.borderColor;

    switch (config.category) {
      case 'classical-sculpture':
      case 'ornate-engraving':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
            {/* Greco-Roman / Baroque Sunburst & Pediment */}
            <g
              style={{
                transform: `translate3d(${px * 0.4}px, ${py * 0.4}px, 0)`,
                transition: 'transform 180ms ease-out',
              }}
            >
              <circle cx="200" cy="200" r="172" stroke={c1} strokeWidth="1.5" strokeDasharray="6 4" />
              <circle cx="200" cy="200" r="148" stroke={border} strokeWidth="1" />
              {Array.from({ length: 24 }).map((_, i) => {
                const a = (i * Math.PI) / 12;
                return (
                  <line
                    key={i}
                    x1={200 + Math.cos(a) * 115}
                    y1={200 + Math.sin(a) * 115}
                    x2={200 + Math.cos(a) * 168}
                    y2={200 + Math.sin(a) * 168}
                    stroke={i % 2 === 0 ? c1 : c2}
                    strokeWidth={i % 2 === 0 ? '1.5' : '0.75'}
                    opacity="0.65"
                  />
                );
              })}
              {/* Classical Column Fluting Left & Right */}
              <rect x="28" y="60" width="26" height="280" stroke={c1} strokeWidth="1.5" />
              <line x1="36" y1="60" x2="36" y2="340" stroke={c1} strokeWidth="0.8" />
              <line x1="45" y1="60" x2="45" y2="340" stroke={c1} strokeWidth="0.8" />
              <rect x="346" y="60" width="26" height="280" stroke={c1} strokeWidth="1.5" />
              <line x1="354" y1="60" x2="354" y2="340" stroke={c1} strokeWidth="0.8" />
              <line x1="363" y1="60" x2="363" y2="340" stroke={c1} strokeWidth="0.8" />
              {/* Pediment Triangle */}
              <polygon points="18,60 200,14 382,60" stroke={c1} strokeWidth="2" fill={c1 + '15'} />
              {/* Sculptural Bust Silhouette */}
              <path
                d="M140,340 C140,285 260,285 260,340 Z"
                fill={c1 + '33'}
                stroke={c1}
                strokeWidth="2"
              />
              <circle cx="200" cy="185" r="56" stroke={c1} strokeWidth="2" fill={artDirection.bgElevated} />
            </g>
          </svg>
        );

      case 'geometric-construct':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
            {/* Bauhaus / Memphis / Art Deco / Neo-Brutalist Totem */}
            <g
              style={{
                transform: `translate3d(${px * 0.5}px, ${py * 0.5}px, 0)`,
                transition: 'transform 160ms ease-out',
              }}
            >
              <rect x="44" y="44" width="312" height="312" stroke={fg} strokeWidth="2.5" />
              <circle cx="145" cy="145" r="88" fill={c1} />
              <rect
                x="185"
                y="175"
                width="145"
                height="145"
                fill={c2}
                stroke={fg}
                strokeWidth="2.5"
              />
              <polygon
                points="70,335 190,335 130,215"
                fill={artDirection.bgCanvas}
                stroke={fg}
                strokeWidth="3"
              />
              {/* Kinetic staircase / squiggle */}
              <path
                d="M 230 65 L 265 65 L 265 95 L 300 95 L 300 125 L 335 125"
                stroke={fg}
                strokeWidth="4"
              />
              <line x1="20" y1="200" x2="380" y2="200" stroke={fg} strokeWidth="1.5" strokeDasharray="6 6" />
              <line x1="200" y1="20" x2="200" y2="380" stroke={fg} strokeWidth="1.5" strokeDasharray="6 6" />
            </g>
          </svg>
        );

      case 'cyber-schematic':
      case 'pixel-retro':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
            {/* Cybercore / Pixel Art / Utilitarian HUD Matrix */}
            <g
              style={{
                transform: `translate3d(${px * 0.6}px, ${py * 0.6}px, 0)`,
                transition: 'transform 120ms linear',
              }}
            >
              <rect x="24" y="24" width="352" height="352" stroke={c1} strokeWidth="1.5" />
              <path d="M 24 64 L 64 24 M 336 24 L 376 64 M 24 336 L 64 376 M 336 376 L 376 336" stroke={c2} strokeWidth="2" />
              <circle cx="200" cy="200" r="128" stroke={c1} strokeWidth="1.5" strokeDasharray="12 6" />
              <circle cx="200" cy="200" r="96" stroke={c2} strokeWidth="2" />
              {/* Pixel / Voxel Core */}
              <rect x="152" y="152" width="96" height="96" stroke={c1} strokeWidth="2" fill={c1 + '22'} />
              <rect x="168" y="176" width="20" height="20" fill={c1} />
              <rect x="212" y="176" width="20" height="20" fill={c1} />
              <path d="M 168 220 L 232 220" stroke={c2} strokeWidth="6" />
              {/* Telemetry Crosshairs */}
              <line x1="200" y1="36" x2="200" y2="104" stroke={c1} strokeWidth="1.5" />
              <line x1="200" y1="296" x2="200" y2="364" stroke={c1} strokeWidth="1.5" />
              <line x1="36" y1="200" x2="104" y2="200" stroke={c1} strokeWidth="1.5" />
              <line x1="296" y1="200" x2="364" y2="200" stroke={c1} strokeWidth="1.5" />
            </g>
          </svg>
        );

      case 'synth-horizon':
      case 'fluid-atmospheric':
      case 'glass-3d':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
            <defs>
              <linearGradient id="synthSun" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c1} />
                <stop offset="100%" stopColor={c2} />
              </linearGradient>
            </defs>
            <g
              style={{
                transform: `translate3d(${px * 0.5}px, ${py * 0.5}px, 0)`,
                transition: 'transform 200ms ease-out',
              }}
            >
              {/* Glowing Sun / Orb */}
              <circle cx="200" cy="175" r="105" fill="url(#synthSun)" opacity="0.82" />
              {/* Horizontal Slice Bars */}
              {[195, 215, 235, 255].map((y, idx) => (
                <rect
                  key={y}
                  x="85"
                  y={y}
                  width="230"
                  height={4 + idx * 2}
                  fill={artDirection.bgSurface}
                />
              ))}
              {/* Perspective Vector Horizon */}
              <line x1="16" y1="265" x2="384" y2="265" stroke={c1} strokeWidth="2.5" />
              <line x1="16" y1="295" x2="384" y2="295" stroke={c2} strokeWidth="1.2" />
              <line x1="16" y1="330" x2="384" y2="330" stroke={c2} strokeWidth="1.2" />
              <line x1="16" y1="370" x2="384" y2="370" stroke={c2} strokeWidth="1.2" />
              {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((n) => (
                <line
                  key={n}
                  x1={200 + n * 18}
                  y1="265"
                  x2={200 + n * 58}
                  y2="384"
                  stroke={c1}
                  strokeWidth="1"
                  opacity="0.7"
                />
              ))}
            </g>
          </svg>
        );

      case 'botanical-organic':
      case 'zen-ceramic':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
            <g
              style={{
                transform: `translate3d(${px * 0.35}px, ${py * 0.35}px, 0)`,
                transition: 'transform 240ms ease-out',
              }}
            >
              {/* Arch Frame & Enso / Ceramic Vessel */}
              <path
                d="M 80 350 L 80 170 A 120 120 0 0 1 320 170 L 320 350 Z"
                stroke={c1}
                strokeWidth="2"
                fill={c1 + '12'}
              />
              <circle cx="200" cy="155" r="52" fill={c2 + '35'} stroke={c2} strokeWidth="1.5" />
              {/* Stoneware Vase Silhouette */}
              <path
                d="M 165 230 Q 130 280 155 340 L 245 340 Q 270 280 235 230 Z"
                fill={c1}
                opacity="0.85"
              />
              {/* Botanical Branch & Leaves */}
              <path d="M 200 235 Q 210 150 265 95" stroke={fg} strokeWidth="2.5" />
              <ellipse cx="230" cy="155" rx="22" ry="10" transform="rotate(-30 230 155)" fill={c2} />
              <ellipse cx="178" cy="175" rx="22" ry="10" transform="rotate(25 178 175)" fill={c1} />
              <ellipse cx="255" cy="115" rx="18" ry="8" transform="rotate(-40 255 115)" fill={c2} />
            </g>
          </svg>
        );

      case 'mechanical-gear':
      case 'maritime-nautical':
      case 'surreal-portal':
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
            <g
              style={{
                transform: `translate3d(${px * 0.45}px, ${py * 0.45}px, 0) rotate(${
                  hovered ? 12 : 0
                }deg)`,
                transformOrigin: '200px 200px',
                transition: 'transform 300ms ease-out',
              }}
            >
              {/* Astrolabe / Compass Rose / Escapement Gear */}
              <circle cx="200" cy="200" r="156" stroke={c1} strokeWidth="2.5" />
              <circle cx="200" cy="200" r="126" stroke={c2} strokeWidth="1.5" strokeDasharray="8 6" />
              <circle cx="200" cy="200" r="84" stroke={c1} strokeWidth="2" />
              {/* Compass / Star Points */}
              <polygon
                points="200,28 222,178 372,200 222,222 200,372 178,222 28,200 178,178"
                stroke={c1}
                strokeWidth="1.8"
                fill={c1 + '18'}
              />
              {/* Surreal Eye / Center Dial */}
              <ellipse cx="200" cy="200" rx="48" ry="28" stroke={fg} strokeWidth="2" fill={artDirection.bgElevated} />
              <circle cx="200" cy="200" r="14" fill={c1} />
            </g>
          </svg>
        );

      default:
        return (
          <svg viewBox="0 0 400 400" className="w-full h-full" fill="none">
            <g
              style={{
                transform: `translate3d(${px * 0.5}px, ${py * 0.5}px, 0)`,
                transition: 'transform 180ms ease-out',
              }}
            >
              <rect x="40" y="40" width="320" height="320" stroke={c1} strokeWidth="2" />
              <circle cx="200" cy="200" r="115" fill={c1 + '25'} stroke={c1} strokeWidth="2.5" />
              <path d="M 85 315 L 315 85 M 85 85 L 315 315" stroke={c2} strokeWidth="1.5" />
              <rect x="140" y="140" width="120" height="120" stroke={fg} strokeWidth="2" fill={artDirection.bgElevated} />
            </g>
          </svg>
        );
    }
  };

  const showPortraitLayer =
    !showPureVector &&
    (config.framingMode !== 'pure-procedural-totem' || hovered) &&
    !imgError;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onCyclePhoto();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCyclePhoto();
        }
      }}
      aria-label={`Interactive ${artDirection.name} artwork and portrait (${photo.caption}). Click to cycle visual plate.`}
      className={`relative group cursor-pointer select-none overflow-hidden flex items-center justify-center transition-transform duration-300 ${
        compact ? 'w-full h-full' : 'w-full h-full min-h-[200px]'
      }`}
      style={{
        backgroundColor: artDirection.bgElevated,
        border:
          artDirection.borderStyle === 'brutal-offset'
            ? `2.5px solid ${artDirection.borderColor}`
            : artDirection.borderStyle === 'double-frame'
            ? `3px double ${artDirection.borderColor}`
            : artDirection.borderStyle === 'dashed-sketch'
            ? `2px dashed ${artDirection.borderColor}`
            : `1px solid ${artDirection.borderColor}`,
        boxShadow:
          artDirection.borderStyle === 'brutal-offset'
            ? compact
              ? `3px 3px 0px ${artDirection.accentPrimary}`
              : `6px 6px 0px ${artDirection.accentPrimary}`
            : undefined,
        transform: compact
          ? undefined
          : `rotate(${config.rotationDeg}deg) scale(${
              hovered ? 1.015 : 1
            })`,
      }}
    >
      {/* Layer 1: Style-Specific Procedural SVG Artwork */}
      <div className={`absolute inset-0 ${compact ? 'p-0.5' : 'p-2 sm:p-4'} pointer-events-none`}>
        {renderCategoryVectorArt()}
      </div>

      {/* Layer 2: Art-Directed Portrait Cutout / Medallion Integration */}
      {showPortraitLayer && (
        <div
          className={`relative z-10 transition-transform duration-300 overflow-hidden ${
            compact
              ? 'w-[76%] h-[76%] border'
              : config.category === 'classical-sculpture' ||
                config.category === 'ornate-engraving' ||
                config.category === 'maritime-nautical' ||
                config.category === 'mechanical-gear'
              ? 'w-[62%] aspect-square rounded-full border-2'
              : config.category === 'collage-scrapbook'
              ? 'w-[68%] h-[72%] p-2 bg-white shadow-lg -rotate-2'
              : 'w-[66%] h-[74%] border-2'
          }`}
          style={{
            borderColor: artDirection.accentPrimary,
            transform: compact ? undefined : `translate3d(${-px * 0.35}px, ${-py * 0.35}px, 0)`,
          }}
        >
          <img
            src={photo.url}
            alt={photo.caption}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
            style={{ filter: getPhotoFilter() }}
          />
          {/* Duotone / Style Tint Wash */}
          {artDirection.photoTreatment === 'duotone-accent' && (
            <div
              className="absolute inset-0 mix-blend-color opacity-40 pointer-events-none"
              style={{ backgroundColor: artDirection.accentPrimary }}
            />
          )}
        </div>
      )}

      {/* Layer 3: Interactive Artwork Controls & Subject Caption */}
      {compact ? (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-black/70 px-1 py-0.5 text-[9px] font-mono text-white text-center truncate pointer-events-none">
          Swap Art
        </div>
      ) : (
        <div className="absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-2.5 sm:p-3.5 text-white flex items-end justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] sm:text-[11px] font-mono text-white/80 truncate">
              {config.subject}
            </div>
            <div
              className="text-xs sm:text-sm font-bold truncate"
              style={{ fontFamily: artDirection.fontDisplay }}
            >
              {showPortraitLayer ? photo.caption : config.title}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowPureVector((v) => !v);
              }}
              className="px-2 py-1 text-[10px] font-mono bg-black/65 hover:bg-black text-white border border-white/25 cursor-pointer whitespace-nowrap"
              aria-label="Toggle between Pure Vector Illustration and Portrait Sculpture"
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              {showPureVector ? 'Portrait + Art' : 'Pure Vector'}
            </button>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[10px] font-mono bg-black/65 text-white border border-white/20">
              <Camera className="w-3 h-3" />
              <span>Swap</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
