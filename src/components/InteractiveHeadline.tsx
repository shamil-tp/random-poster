import React, { useState } from 'react';
import { SynthesizedArtDirection } from '../engine/hybridGenerator';
import { TypographyConfig } from '../engine/typographyGenerator';

interface InteractiveHeadlineProps {
  text: string;
  subtitle: string;
  artDirection: SynthesizedArtDirection;
  typography: TypographyConfig;
  pointer: { x: number; y: number; active: boolean };
  onCycleTypography: () => void;
  sizeClass?: string;
}

export const InteractiveHeadline: React.FC<InteractiveHeadlineProps> = ({
  text,
  subtitle,
  artDirection,
  typography,
  pointer,
  onCycleTypography,
  sizeClass = 'text-3xl sm:text-5xl lg:text-6xl',
}) => {
  const [hovered, setHovered] = useState(false);
  const displayTitle = typography.uppercaseHeadline ? text.toUpperCase() : text;
  const chars = displayTitle.split('');

  const offsetX = pointer.active ? (pointer.x - 0.5) * 10 : 0;
  const offsetY = pointer.active ? (pointer.y - 0.5) * 6 : 0;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        onCycleTypography();
      }}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCycleTypography();
        }
      }}
      aria-label={`${text} — ${subtitle}. Interactive typography (${typography.interactiveLabel}). Click to cycle font variation.`}
      className="group relative cursor-pointer select-none"
    >
      {/* Curved SVG Arc Headline Option (when headlineTreatment === 'curved-svg-arc' on desktop) */}
      {typography.headlineTreatment === 'curved-svg-arc' && (
        <div className="hidden xl:block w-full h-20 -mb-2 overflow-visible">
          <svg viewBox="0 0 680 95" className="w-full h-full overflow-visible">
            <defs>
              <path
                id="editorialArcPath"
                d="M 10,82 Q 340,12 670,82"
                fill="none"
              />
            </defs>
            <text
              fill={artDirection.textPrimary}
              style={{
                fontFamily: typography.fontDisplay,
                fontSize: '46px',
                fontWeight: 800,
                letterSpacing: hovered ? '0.14em' : '0.05em',
                transition: 'letter-spacing 220ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <textPath href="#editorialArcPath" startOffset="50%" textAnchor="middle">
                {displayTitle}
              </textPath>
            </text>
          </svg>
        </div>
      )}

      {/* Standard / Kinetic Character-Level Interactive Headline */}
      <div className={typography.headlineTreatment === 'curved-svg-arc' ? 'xl:hidden' : ''}>
        {/* Chromatic / Layered Echo Backplate */}
        {(typography.headlineTreatment === 'layered-echo-shadow' ||
          typography.interactiveMode === 'chromatic-echo-split') && (
          <div
            aria-hidden="true"
            className={`${sizeClass} font-bold tracking-tight leading-none absolute inset-0 pointer-events-none transition-transform duration-150`}
            style={{
              fontFamily: typography.fontDisplay,
              color: 'transparent',
              WebkitTextStroke: `1.5px ${artDirection.accentPrimary}`,
              opacity: hovered ? 0.65 : 0.3,
              transform: `translate3d(${hovered ? offsetX + 5 : 3}px, ${
                hovered ? offsetY + 4 : 3
              }px, 0)`,
            }}
          >
            {displayTitle}
          </div>
        )}

        <h1
          className={`${sizeClass} font-bold tracking-tight leading-none relative z-10 flex flex-wrap items-baseline`}
          style={{
            fontFamily: typography.fontDisplay,
            letterSpacing:
              hovered && typography.interactiveMode === 'hover-letter-spread'
                ? '0.09em'
                : typography.letterSpacing,
            transition: 'letter-spacing 200ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {chars.map((ch, idx) => {
            if (ch === ' ') {
              return (
                <span key={idx} className="inline-block w-[0.28em]">
                  &nbsp;
                </span>
              );
            }

            // Compute smooth cursor-wave or hover effect per character
            const charRatio = idx / Math.max(1, chars.length - 1);
            const distFromPointer = Math.abs(pointer.x - charRatio);
            const waveLift =
              hovered && pointer.active
                ? Math.max(0, 1 - distFromPointer * 2.5) * -6
                : 0;
            const charRotate =
              hovered && typography.interactiveMode === 'word-tilt-shift'
                ? (idx % 2 === 0 ? 1 : -1) * 2.5
                : 0;

            const isOutlineChar =
              typography.headlineTreatment === 'split-outline-solid' &&
              idx >= Math.floor(chars.length / 2);

            const isGradient =
              typography.headlineTreatment === 'gradient-iridescent';

            return (
              <span
                key={idx}
                className="inline-block transition-transform duration-150 ease-out"
                style={{
                  transform: `translate3d(0, ${waveLift}px, 0) rotate(${charRotate}deg)`,
                  color:
                    isOutlineChar && !hovered
                      ? 'transparent'
                      : isGradient
                      ? artDirection.accentPrimary
                      : artDirection.textPrimary,
                  WebkitTextStroke:
                    isOutlineChar && !hovered
                      ? `1.5px ${artDirection.textPrimary}`
                      : hovered &&
                        typography.interactiveMode === 'outline-fill-invert'
                      ? `1.5px ${artDirection.accentPrimary}`
                      : undefined,
                }}
              >
                {ch}
              </span>
            );
          })}
        </h1>
      </div>

      {/* Role & Interactive Type Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
        <p
          className="text-xs sm:text-sm lg:text-base font-semibold truncate"
          style={{
            color: artDirection.accentPrimary,
            fontFamily: typography.fontBody,
          }}
        >
          {subtitle}
        </p>
        <span
          className="text-[10px] sm:text-[11px] font-mono opacity-75 group-hover:opacity-100 transition-opacity"
          style={{ color: artDirection.textSecondary }}
        >
          {typography.pairingName} · Click Title or Press [T]
        </span>
      </div>
    </div>
  );
};
