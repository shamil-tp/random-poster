import React from 'react';
import { GeneratedPosterStyle } from '../utils/posterStyles';

interface PosterMotifLayerProps {
  style: GeneratedPosterStyle;
  pointer: { x: number; y: number; active: boolean };
  interactivePulse: number;
}

export const PosterMotifLayer: React.FC<PosterMotifLayerProps> = ({
  style,
  pointer,
  interactivePulse,
}) => {
  const shiftX = (pointer.x - 0.5) * 24;
  const shiftY = (pointer.y - 0.5) * 24;
  const rot = (pointer.x - 0.5) * 8 + (interactivePulse % 2 === 1 ? 3 : 0);

  const renderMotifSvg = () => {
    switch (style.motif) {
      case 'laurel-columns':
      case 'acanthus-vine':
      case 'victorian-damask':
      case 'baroque-flourish':
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Classical Pediment & Column Fluting */}
            <g opacity="0.18" stroke={style.accentPrimary} strokeWidth="1.5">
              <line x1="90" y1="40" x2="90" y2="860" />
              <line x1="102" y1="40" x2="102" y2="860" />
              <line x1="1338" y1="40" x2="1338" y2="860" />
              <line x1="1350" y1="40" x2="1350" y2="860" />
              <circle cx="720" cy="450" r="340" strokeDasharray="6 6" />
              <circle cx="720" cy="450" r="290" stroke={style.accentSecondary} />
              <path d="M 380 120 Q 720 40 1060 120" strokeWidth="2" />
              <path d="M 380 780 Q 720 860 1060 780" strokeWidth="2" />
            </g>
          </svg>
        );

      case 'aurora-waves':
      case 'ethereal-halo':
      case 'frutiger-bubbles':
      case 'glass-prisms':
        return (
          <div className="w-full h-full relative overflow-hidden">
            <div
              className="absolute -top-32 -left-24 w-[36rem] h-[36rem] rounded-full blur-3xl transition-transform duration-200"
              style={{
                backgroundColor: style.accentPrimary,
                opacity: style.isDark ? 0.18 : 0.14,
                transform: `translate3d(${shiftX * 1.4}px, ${shiftY * 1.4}px, 0)`,
              }}
            />
            <div
              className="absolute -bottom-40 -right-24 w-[40rem] h-[40rem] rounded-full blur-3xl transition-transform duration-200"
              style={{
                backgroundColor: style.accentSecondary,
                opacity: style.isDark ? 0.16 : 0.12,
                transform: `translate3d(${-shiftX * 1.2}px, ${-shiftY * 1.2}px, 0)`,
              }}
            />
          </div>
        );

      case 'bauhaus-primitives':
      case 'memphis-squiggles':
      case 'pop-art-halftone':
      case 'kitsch-starburst':
      case 'neo-brutalist-offset':
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g opacity="0.16">
              <circle
                cx="1220"
                cy="180"
                r="130"
                fill={style.accentPrimary}
              />
              <rect
                x="110"
                y="620"
                width="180"
                height="180"
                stroke={style.accentSecondary}
                strokeWidth="6"
              />
              <polygon
                points="1180,780 1320,780 1250,650"
                stroke={style.textPrimary}
                strokeWidth="4"
              />
              <line
                x1="0"
                y1="220"
                x2="1440"
                y2="220"
                stroke={style.borderColor}
                strokeWidth="1"
              />
              <line
                x1="460"
                y1="0"
                x2="460"
                y2="900"
                stroke={style.borderColor}
                strokeWidth="1"
              />
            </g>
          </svg>
        );

      case 'art-deco-sunburst':
      case 'luxury-monogram':
      case 'filigree-lace':
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g opacity="0.2" stroke={style.accentPrimary} strokeWidth="1.2">
              {Array.from({ length: 16 }).map((_, idx) => {
                const angle = (idx * Math.PI) / 15;
                const x2 = 720 + Math.cos(angle) * 900;
                const y2 = 900 - Math.sin(angle) * 900;
                return <line key={idx} x1="720" y1="900" x2={x2} y2={y2} />;
              })}
              <rect x="48" y="48" width="1344" height="804" />
              <rect x="64" y="64" width="1312" height="772" />
              <polygon points="720,30 750,64 720,98 690,64" />
            </g>
          </svg>
        );

      case 'cyber-circuit':
      case 'synthwave-horizon':
      case 'vaporwave-bust-grid':
      case 'y2k-chrome-matrix':
      case 'pixel-grid':
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g opacity="0.18" stroke={style.accentPrimary} strokeWidth="1">
              {/* Perspective Horizon Grid */}
              <line x1="0" y1="620" x2="1440" y2="620" strokeWidth="2" />
              <line x1="0" y1="670" x2="1440" y2="670" />
              <line x1="0" y1="735" x2="1440" y2="735" />
              <line x1="0" y1="815" x2="1440" y2="815" />
              {Array.from({ length: 13 }).map((_, idx) => {
                const topX = 720 + (idx - 6) * 60;
                const botX = 720 + (idx - 6) * 220;
                return <line key={idx} x1={topX} y1="620" x2={botX} y2="900" />;
              })}
              <circle
                cx="720"
                cy="620"
                r="140"
                stroke={style.accentSecondary}
                strokeWidth="2"
              />
            </g>
          </svg>
        );

      case 'sketch-crosshatch':
      case 'utilitarian-spec':
      case 'brutalist-crosshair':
      case 'modular-type-blocks':
      case 'nautical-compass':
      case 'steampunk-gears':
      case 'academia-astrolabe':
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g opacity="0.18" stroke={style.borderColor} strokeWidth="1">
              {/* Architectural Grid & Crosshairs */}
              <line x1="360" y1="0" x2="360" y2="900" strokeDasharray="4 4" />
              <line x1="720" y1="0" x2="720" y2="900" strokeDasharray="4 4" />
              <line x1="1080" y1="0" x2="1080" y2="900" strokeDasharray="4 4" />
              <line x1="0" y1="300" x2="1440" y2="300" strokeDasharray="4 4" />
              <line x1="0" y1="600" x2="1440" y2="600" strokeDasharray="4 4" />
              <circle
                cx="1180"
                cy="240"
                r="110"
                stroke={style.accentPrimary}
                strokeWidth="1.5"
              />
              <circle
                cx="1180"
                cy="240"
                r="82"
                stroke={style.accentSecondary}
                strokeDasharray="8 4"
              />
              <line x1="1040" y1="240" x2="1320" y2="240" stroke={style.accentPrimary} />
              <line x1="1180" y1="100" x2="1180" y2="380" stroke={style.accentPrimary} />
            </g>
          </svg>
        );

      default:
        return (
          <svg
            className="w-full h-full"
            viewBox="0 0 1440 900"
            fill="none"
            preserveAspectRatio="xMidYMid slice"
          >
            <g opacity="0.16" stroke={style.accentPrimary} strokeWidth="1.5">
              <circle cx="1150" cy="450" r="260" />
              <circle cx="1150" cy="450" r="190" stroke={style.accentSecondary} strokeDasharray="5 5" />
              <path d="M 80 80 L 200 80 M 80 80 L 80 200" />
              <path d="M 1360 820 L 1240 820 M 1360 820 L 1360 700" />
            </g>
          </svg>
        );
    }
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden z-0"
      aria-hidden="true"
    >
      <div
        className="w-full h-full transition-transform duration-150 ease-out"
        style={{
          transform: `translate3d(${shiftX * 0.5}px, ${shiftY * 0.5}px, 0) rotate(${rot * 0.15}deg)`,
        }}
      >
        {renderMotifSvg()}
      </div>

      {/* Interactive Spotlight / Chiaroscuro Cursor Overlay */}
      {(style.microInteraction === 'spotlight-glow' ||
        style.microInteraction === 'chromatic-shift' ||
        pointer.active) && (
        <div
          className="absolute inset-0 transition-opacity duration-200"
          style={{
            opacity: pointer.active ? 0.22 : 0.1,
            background: `radial-gradient(520px circle at ${pointer.x * 100}% ${
              pointer.y * 100
            }%, ${style.accentPrimary}44, transparent 70%)`,
          }}
        />
      )}
    </div>
  );
};
