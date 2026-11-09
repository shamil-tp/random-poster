import React, { useState, useRef } from 'react';
import {
  ArrowUpRight,
  Sparkles,
  FolderGit2,
  Award,
  Terminal,
  RefreshCw,
  LayoutGrid,
  Type as TypeIcon,
} from 'lucide-react';
import { CompleteDesignState } from '../engine/designEngine';
import { PosterDataSlice, PortfolioIdentity } from '../utils/knowledgeParser';
import { PosterMotifLayer } from './PosterMotifLayer';
import { ProceduralIllustration } from '../engine/illustrationGenerator';
import { InteractiveHeadline } from './InteractiveHeadline';

interface PosterCanvasProps {
  designState: CompleteDesignState;
  slice: PosterDataSlice;
  identity: PortfolioIdentity;
  onCyclePhoto: () => void;
  onCycleProject: () => void;
  onSwapSecondaryToPrimary: () => void;
  onCycleTypography: () => void;
  onCycleLayout: () => void;
  onOpenStyleModal: () => void;
  onOpenDossierModal: () => void;
}

export const PosterCanvas: React.FC<PosterCanvasProps> = ({
  designState,
  slice,
  identity,
  onCyclePhoto,
  onCycleProject,
  onSwapSecondaryToPrimary,
  onCycleTypography,
  onCycleLayout,
  onOpenStyleModal,
  onOpenDossierModal,
}) => {
  const { artDirection: style, typography, layout, illustration } = designState;
  const containerRef = useRef<HTMLDivElement>(null);
  const [pointer, setPointer] = useState({ x: 0.5, y: 0.5, active: false });
  const [expandedSpecTab, setExpandedSpecTab] = useState<'architecture' | 'verification'>(
    'architecture'
  );
  const [interactivePulse, setInteractivePulse] = useState(0);

  const handlePointerMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    setPointer({ x, y, active: true });
  };

  const handlePointerLeave = () => {
    setPointer({ x: 0.5, y: 0.5, active: false });
  };

  const tiltX = pointer.active ? (0.5 - pointer.y) * 5 : 0;
  const tiltY = pointer.active ? (pointer.x - 0.5) * 5 : 0;

  const getFrameBorderStyle = (isElevatedCard = false): React.CSSProperties => {
    if (style.borderStyle === 'brutal-offset') {
      return {
        border: `2px solid ${style.borderColor}`,
        boxShadow: isElevatedCard
          ? `4px 4px 0px ${style.borderColor}`
          : `7px 7px 0px ${style.accentPrimary}`,
      };
    }
    if (style.borderStyle === 'double-frame') {
      return { border: `3px double ${style.borderColor}` };
    }
    if (style.borderStyle === 'dashed-sketch') {
      return { border: `1.5px dashed ${style.borderColor}` };
    }
    if (style.borderStyle === 'glass-rim') {
      return {
        border: `1px solid ${style.accentPrimary}55`,
        backdropFilter: 'blur(12px)',
      };
    }
    return { border: `1px solid ${style.borderColor}` };
  };

  // Shared Featured Project Dossier Block (adapts to layout density & drop-cap option)
  const renderDossierBlock = (compactMode = false) => (
    <div
      role="region"
      aria-label={`Featured Project Dossier ${slice.focalProject.name}`}
      onClick={(e) => {
        e.stopPropagation();
        setExpandedSpecTab((prev) =>
          prev === 'architecture' ? 'verification' : 'architecture'
        );
      }}
      className="flex-1 min-h-0 flex flex-col justify-between p-3 sm:p-4 transition-transform duration-200 cursor-pointer overflow-hidden"
      style={{
        backgroundColor: style.bgElevated,
        ...getFrameBorderStyle(true),
      }}
    >
      <div className="shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
          <span
            className="text-[11px] sm:text-xs font-semibold truncate"
            style={{ fontFamily: typography.fontMono, color: style.accentPrimary }}
          >
            {slice.focalProject.index}. {slice.focalProject.category}
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedSpecTab('architecture');
              }}
              className="text-[11px] px-1.5 py-0.5 font-medium cursor-pointer"
              style={{
                fontFamily: typography.fontMono,
                color:
                  expandedSpecTab === 'architecture'
                    ? style.accentPrimary
                    : style.textSecondary,
                textDecoration:
                  expandedSpecTab === 'architecture' ? 'underline' : 'none',
              }}
            >
              Architecture
            </button>
            <span aria-hidden="true" style={{ color: style.textSecondary }}>
              /
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedSpecTab('verification');
              }}
              className="text-[11px] px-1.5 py-0.5 font-medium cursor-pointer"
              style={{
                fontFamily: typography.fontMono,
                color:
                  expandedSpecTab === 'verification'
                    ? style.accentPrimary
                    : style.textSecondary,
                textDecoration:
                  expandedSpecTab === 'verification' ? 'underline' : 'none',
              }}
            >
              Metrics & Links
            </button>
            <span aria-hidden="true" style={{ color: style.textSecondary }}>
              ·
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCycleProject();
              }}
              className="inline-flex items-center gap-1 text-[11px] font-medium hover:underline cursor-pointer"
              style={{ color: style.textPrimary, fontFamily: typography.fontMono }}
              aria-label="Cycle featured project dossier"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Swap Dossier</span>
            </button>
          </div>
        </div>

        <h2
          className={`${
            compactMode ? 'text-base sm:text-xl' : 'text-base sm:text-2xl'
          } font-bold tracking-tight leading-snug`}
          style={{
            fontFamily: typography.fontDisplay,
            color: style.textPrimary,
            textWrap: 'balance',
          }}
        >
          {slice.focalProject.name}
        </h2>
        <p
          className="text-[11px] sm:text-xs mt-0.5 font-medium truncate"
          style={{ color: style.textSecondary, fontFamily: typography.fontBody }}
        >
          {slice.focalProject.ownership}
        </p>
      </div>

      {/* Middle Bullets or Metrics */}
      <div className="my-auto py-1.5 overflow-hidden">
        {expandedSpecTab === 'architecture' ? (
          <ul
            className="space-y-1 text-xs sm:text-sm leading-snug"
            style={{ fontFamily: typography.fontBody }}
          >
            {slice.focalProject.highlights
              .slice(0, compactMode ? 2 : 3)
              .map((bullet, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2"
                  style={{ color: style.textPrimary }}
                >
                  {idx === 0 && typography.decorativeDropCap ? (
                    <span
                      className="text-xl sm:text-2xl font-bold leading-none px-1.5 py-0.5 shrink-0"
                      style={{
                        fontFamily: typography.fontDisplay,
                        color: style.bgCanvas,
                        backgroundColor: style.accentPrimary,
                      }}
                    >
                      {bullet.charAt(0)}
                    </span>
                  ) : (
                    <span
                      className="font-mono text-[11px] font-bold mt-0.5 shrink-0"
                      style={{ color: style.accentPrimary }}
                    >
                      0{idx + 1}.
                    </span>
                  )}
                  <span className="line-clamp-2">
                    {idx === 0 && typography.decorativeDropCap
                      ? bullet.slice(1)
                      : bullet}
                  </span>
                </li>
              ))}
          </ul>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1">
            {slice.focalProject.metrics.map((metric, idx) => (
              <div
                key={idx}
                className="p-2 border"
                style={{
                  borderColor: style.borderColor,
                  backgroundColor: style.bgSurface,
                }}
              >
                <div
                  className="text-[10px] font-mono tabular-nums"
                  style={{ color: style.textSecondary }}
                >
                  Metric 0{idx + 1}
                </div>
                <div
                  className="text-xs font-bold mt-0.5 tabular-nums truncate"
                  style={{
                    color: style.textPrimary,
                    fontFamily: typography.fontDisplay,
                  }}
                >
                  {metric}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Tech Stack & Links */}
      <div
        className="shrink-0 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs"
        style={{ borderColor: style.borderColor }}
      >
        <div
          className="truncate max-w-full sm:max-w-[65%]"
          style={{ fontFamily: typography.fontMono, color: style.accentPrimary }}
        >
          {slice.focalProject.techStack.join(' · ')}
        </div>

        <div
          className="flex items-center gap-3 shrink-0"
          style={{ fontFamily: typography.fontMono }}
        >
          {slice.focalProject.liveUrl && (
            <a
              href={slice.focalProject.liveUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 font-semibold hover:underline"
              style={{ color: style.textPrimary }}
            >
              <span>Live Deployment</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
          {slice.focalProject.repoUrl && (
            <a
              href={slice.focalProject.repoUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 font-semibold hover:underline"
              style={{ color: style.accentPrimary }}
            >
              <FolderGit2 className="w-3.5 h-3.5" />
              <span>Source</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );

  // Secondary Credential & Skill Strip
  const renderSecondaryStrip = () => (
    <div className="shrink-0 grid grid-cols-2 gap-2 sm:gap-3">
      <div
        onClick={(e) => {
          e.stopPropagation();
          onOpenDossierModal();
        }}
        className="p-2.5 sm:p-3 cursor-pointer flex flex-col justify-between min-w-0"
        style={{
          backgroundColor: style.bgElevated,
          ...getFrameBorderStyle(true),
        }}
      >
        <div
          className="flex items-center justify-between text-[11px] mb-0.5 gap-1"
          style={{ fontFamily: typography.fontMono, color: style.accentPrimary }}
        >
          <span className="inline-flex items-center gap-1 font-semibold truncate">
            <Award className="w-3 h-3 shrink-0" />
            <span className="truncate">{slice.featuredHackathon.result}</span>
          </span>
          <span style={{ color: style.textSecondary }} className="hidden sm:inline shrink-0">
            {slice.featuredHackathon.dates}
          </span>
        </div>
        <div
          className="text-xs sm:text-sm font-bold truncate"
          style={{ fontFamily: typography.fontDisplay, color: style.textPrimary }}
        >
          {slice.featuredHackathon.title}
        </div>
        <div className="text-[11px] truncate" style={{ color: style.textSecondary }}>
          {slice.featuredExperience.title} · {slice.featuredExperience.organization}
        </div>
      </div>

      <div
        onClick={(e) => {
          e.stopPropagation();
          onSwapSecondaryToPrimary();
        }}
        className="p-2.5 sm:p-3 cursor-pointer flex flex-col justify-between min-w-0"
        style={{
          backgroundColor: style.bgElevated,
          ...getFrameBorderStyle(true),
        }}
      >
        <div
          className="flex items-center justify-between text-[11px] mb-0.5 gap-1"
          style={{ fontFamily: typography.fontMono, color: style.accentPrimary }}
        >
          <span className="inline-flex items-center gap-1 font-semibold truncate">
            <Terminal className="w-3 h-3 shrink-0" />
            <span className="truncate">Next: {slice.secondaryProject.shortName}</span>
          </span>
          <span style={{ color: style.textSecondary }} className="hidden sm:inline shrink-0">
            Click to focus
          </span>
        </div>
        <div
          className="text-xs sm:text-sm font-bold truncate"
          style={{ fontFamily: typography.fontDisplay, color: style.textPrimary }}
        >
          {slice.featuredSkillGroup.category}
        </div>
        <div
          className="text-[11px] truncate"
          style={{ fontFamily: typography.fontMono, color: style.textSecondary }}
        >
          {slice.featuredSkillGroup.items.slice(0, 5).join(' · ')}
        </div>
      </div>
    </div>
  );

  // Style Direction Info Card
  const renderStyleInfoCard = () => (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onOpenStyleModal();
      }}
      className="shrink-0 p-2.5 sm:p-3 cursor-pointer"
      style={{
        backgroundColor: style.bgElevated,
        ...getFrameBorderStyle(true),
      }}
    >
      <div className="flex items-center justify-between gap-2 text-[11px] mb-0.5">
        <span
          className="font-mono font-semibold inline-flex items-center gap-1"
          style={{ color: style.accentPrimary }}
        >
          <Sparkles className="w-3 h-3" />
          <span>
            {style.isHybrid ? 'Hybrid Synthesis' : `Style #${style.id}/50`} ·{' '}
            {layout.name}
          </span>
        </span>
        <span
          className="font-mono text-[10px] hover:underline shrink-0"
          style={{ color: style.textSecondary }}
        >
          50 Styles →
        </span>
      </div>
      <div
        className="text-xs sm:text-sm font-bold truncate"
        style={{ fontFamily: typography.fontDisplay, color: style.textPrimary }}
      >
        {style.name}
      </div>
      <p
        className="text-[11px] mt-0.5 line-clamp-1"
        style={{ color: style.textSecondary, fontFamily: typography.fontBody }}
      >
        {style.harmonyNote}
      </p>
    </div>
  );

  // Reusable Identity + Mobile Illustration Header so mobile (< lg) ALWAYS shows the illustration & portrait
  const renderIdentityWithMobileArt = (sizeClass?: string) => (
    <div className="shrink-0 flex items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div
          className="text-[11px] font-mono mb-0.5 truncate"
          style={{ color: style.textSecondary }}
        >
          {identity.location} · {identity.academicStatus} ·{' '}
          <a
            href={identity.domains[1]}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="hover:underline font-semibold"
            style={{ color: style.accentPrimary }}
          >
            shamiltp.me
          </a>
        </div>
        <InteractiveHeadline
          text={identity.fullName}
          subtitle={identity.primaryRole}
          artDirection={style}
          typography={typography}
          pointer={pointer}
          onCycleTypography={onCycleTypography}
          sizeClass={sizeClass}
        />
      </div>

      {/* Mobile Portrait + Procedural Art Preview (< lg) */}
      <div className="lg:hidden w-16 h-16 sm:w-20 sm:h-20 shrink-0">
        <ProceduralIllustration
          artDirection={style}
          config={illustration}
          photo={slice.photo}
          pointer={pointer}
          onCyclePhoto={onCyclePhoto}
          compact
        />
      </div>
    </div>
  );

  // Render the middle composition dynamically based on the 12 Layout Archetypes!
  const renderDynamicLayoutBody = () => {
    switch (layout.id) {
      case 'circular-monument':
      case 'three-column-broadsheet':
        // Symmetrical 3-Column Editorial / Orbital Centerpiece Layout
        return (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 py-2 sm:py-3 items-stretch overflow-hidden">
            {/* Left Column: Identity + Style Manifesto (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between min-h-0 gap-2 overflow-hidden">
              {renderIdentityWithMobileArt('text-2xl sm:text-4xl lg:text-5xl')}
              <div className="hidden lg:flex flex-col gap-2 mt-auto">
                {renderStyleInfoCard()}
              </div>
            </div>

            {/* Center Column: Monumental Circular / Broadsheet Illustration & Portrait (4 cols) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col min-h-0 overflow-hidden">
              <ProceduralIllustration
                artDirection={style}
                config={illustration}
                photo={slice.photo}
                pointer={pointer}
                onCyclePhoto={onCyclePhoto}
              />
            </div>

            {/* Right Column: Featured Project Dossier + Secondary Strip (4 cols) */}
            <div className="lg:col-span-4 flex flex-col justify-between min-h-0 gap-2 overflow-hidden">
              {renderDossierBlock(true)}
              {renderSecondaryStrip()}
            </div>
          </div>
        );

      case 'vertical-spine-editorial':
      case 'bauhaus-constructivist':
        // Constructivist / Vertical Spine Layout: Rotated Vertical Spine Pillar + Geometric Split
        return (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 py-2 sm:py-3 items-stretch overflow-hidden">
            {/* Vertical Spine Pillar (1 col on desktop) */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onCycleLayout();
              }}
              className="hidden lg:flex lg:col-span-1 flex-col items-center justify-between py-4 px-1 cursor-pointer select-none overflow-hidden"
              style={{
                backgroundColor: style.accentPrimary,
                color: style.isDark ? '#09090B' : '#FFFFFF',
              }}
              title="Click or press [L] to randomize layout"
            >
              <span className="text-[10px] font-mono font-bold tracking-widest uppercase [writing-mode:vertical-rl] rotate-180">
                {style.name} · {layout.name}
              </span>
              <span
                className="text-xl font-bold tracking-tighter [writing-mode:vertical-rl] rotate-180"
                style={{ fontFamily: typography.fontDisplay }}
              >
                {identity.fullName.toUpperCase()}
              </span>
            </div>

            {/* Center Content (7 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col justify-between min-h-0 gap-2 overflow-hidden">
              {renderIdentityWithMobileArt('text-2xl sm:text-4xl lg:text-5xl')}
              {renderDossierBlock(false)}
              {renderSecondaryStrip()}
            </div>

            {/* Right Sculpture & Style Card (4 cols on desktop) */}
            <div className="hidden lg:flex lg:col-span-4 flex-col justify-between min-h-0 gap-2.5 overflow-hidden">
              <div className="flex-1 min-h-0">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  pointer={pointer}
                  onCyclePhoto={onCyclePhoto}
                />
              </div>
              {renderStyleInfoCard()}
            </div>
          </div>
        );

      case 'split-poster-duality':
      case 'diagonal-split':
      case 'full-bleed-artwork':
        // Artwork-Led Left Half (5 cols) + Manifesto Right Half (7 cols)
        return (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 py-2 sm:py-3 items-stretch overflow-hidden">
            {/* Left Monumental Visual Stage (5 cols on desktop) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between min-h-0 gap-2.5 overflow-hidden">
              <div className="flex-1 min-h-0">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  pointer={pointer}
                  onCyclePhoto={onCyclePhoto}
                />
              </div>
              {renderStyleInfoCard()}
            </div>

            {/* Right Editorial Manifesto (7 cols on desktop) */}
            <div className="lg:col-span-7 flex flex-col justify-between min-h-0 gap-2 sm:gap-3 overflow-hidden">
              {renderIdentityWithMobileArt()}
              {renderDossierBlock(false)}
              {renderSecondaryStrip()}
            </div>
          </div>
        );

      case 'layered-collage-zine':
      case 'asymmetric-avant-garde':
        // Tactile Rotated Zine / Offset Avant-Garde Composition
        return (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 py-2 sm:py-3 items-stretch overflow-hidden">
            {/* Left Collage Column (7 cols) with slight editorial offset */}
            <div className="lg:col-span-7 flex flex-col justify-between min-h-0 gap-2 sm:gap-3 overflow-hidden">
              <div
                className="p-2.5 sm:p-3 transition-transform"
                style={{
                  backgroundColor: style.bgElevated,
                  ...getFrameBorderStyle(true),
                }}
              >
                {renderIdentityWithMobileArt('text-2xl sm:text-4xl lg:text-5xl')}
              </div>
              {renderDossierBlock(true)}
              {renderSecondaryStrip()}
            </div>

            {/* Right Overlapping Collage Cutout Stage (5 cols) */}
            <div className="hidden lg:flex lg:col-span-5 flex-col justify-between min-h-0 gap-2.5 overflow-hidden">
              <div className="flex-1 min-h-0 p-1">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  pointer={pointer}
                  onCyclePhoto={onCyclePhoto}
                />
              </div>
              {renderStyleInfoCard()}
            </div>
          </div>
        );

      default:
        // Magazine Cover / Bento Playground / Brutalist Manifesto (8 cols left + 4 cols right)
        return (
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 py-2 sm:py-3 items-stretch overflow-hidden">
            <div className="lg:col-span-8 flex flex-col justify-between min-h-0 gap-2 sm:gap-3 overflow-hidden">
              {renderIdentityWithMobileArt()}
              {renderDossierBlock(false)}
              {renderSecondaryStrip()}
            </div>

            <div className="hidden lg:flex lg:col-span-4 flex-col justify-between min-h-0 gap-2.5 overflow-hidden">
              <div className="flex-1 min-h-0">
                <ProceduralIllustration
                  artDirection={style}
                  config={illustration}
                  photo={slice.photo}
                  pointer={pointer}
                  onCyclePhoto={onCyclePhoto}
                />
              </div>
              {renderStyleInfoCard()}
            </div>
          </div>
        );
    }
  };

  return (
    <main
      ref={containerRef}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
      onClick={() => setInteractivePulse((p) => p + 1)}
      data-testid="poster-canvas"
      data-style-slug={style.slug}
      data-layout-id={layout.id}
      data-edition={style.editionNumber}
      className="relative flex-1 w-full h-full min-h-0 overflow-hidden flex flex-col justify-between p-2.5 sm:p-4 lg:p-5 transition-colors duration-300"
      style={{
        backgroundColor: style.bgCanvas,
        color: style.textPrimary,
        fontFamily: typography.fontBody,
      }}
    >
      {/* Background SVG & Ambient Motif Layer */}
      <PosterMotifLayer
        style={style}
        pointer={pointer}
        interactivePulse={interactivePulse}
      />

      {/* Outer Poster Frame */}
      <div
        className="relative z-10 w-full h-full min-h-0 flex flex-col justify-between p-3 sm:p-5 overflow-hidden transition-transform duration-200 ease-out"
        style={{
          backgroundColor:
            style.borderStyle === 'glass-rim'
              ? `${style.bgSurface}CC`
              : style.bgSurface,
          ...getFrameBorderStyle(false),
          transform:
            style.microInteraction === 'tilt-3d' && pointer.active
              ? `perspective(1400px) rotateX(${tiltX * 0.3}deg) rotateY(${tiltY * 0.3}deg)`
              : undefined,
        }}
      >
        {/* TOP METADATA BAR: Style DNA, Layout Archetype & Edition */}
        <div
          className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b shrink-0"
          style={{ borderColor: style.borderColor }}
        >
          <div
            className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs"
            style={{ fontFamily: typography.fontMono }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenStyleModal();
              }}
              className="font-semibold tracking-tight hover:underline cursor-pointer text-left"
              style={{ color: style.accentPrimary }}
              aria-label={`Inspect active style ${style.name}`}
            >
              {style.isHybrid
                ? `Hybrid · ${style.name}`
                : `Style ${String(style.id).padStart(2, '0')}/50 · ${style.name}`}
            </button>
            <span aria-hidden="true" style={{ color: style.textSecondary }}>
              ·
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCycleLayout();
              }}
              className="hidden sm:inline-flex items-center gap-1 hover:underline cursor-pointer"
              style={{ color: style.textPrimary }}
              aria-label={`Active layout ${layout.name}. Click to randomize layout.`}
            >
              <LayoutGrid className="w-3 h-3" style={{ color: style.accentPrimary }} />
              <span>Layout: {layout.name}</span>
            </button>
            <span
              aria-hidden="true"
              style={{ color: style.textSecondary }}
              className="hidden md:inline"
            >
              ·
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCycleTypography();
              }}
              className="hidden md:inline-flex items-center gap-1 hover:underline cursor-pointer"
              style={{ color: style.textSecondary }}
              aria-label={`Active typography ${typography.pairingName}. Click to randomize typography.`}
            >
              <TypeIcon className="w-3 h-3" style={{ color: style.accentPrimary }} />
              <span>Type: {typography.pairingName}</span>
            </button>
          </div>

          <div
            className="flex items-center gap-2 text-[11px] sm:text-xs tabular-nums"
            style={{ fontFamily: typography.fontMono, color: style.textSecondary }}
          >
            {slice.searchQuery ? (
              <span style={{ color: style.accentPrimary }} className="font-semibold">
                {slice.matchSummary}
              </span>
            ) : (
              <span className="hidden xl:inline">
                Shortcuts: [Space] Regenerate · [T] Type · [L] Layout
              </span>
            )}
            <span aria-hidden="true" className="hidden sm:inline">
              ·
            </span>
            <span className="font-semibold" style={{ color: style.textPrimary }}>
              Edition #{String(style.editionNumber).padStart(3, '0')}
            </span>
          </div>
        </div>

        {/* DYNAMIC MULTI-ARCHETYPE BODY */}
        {renderDynamicLayoutBody()}

        {/* FOOTER STRIP: Self-Hosted Subdomains & Contact */}
        <footer
          className="shrink-0 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs"
          style={{
            borderColor: style.borderColor,
            fontFamily: typography.fontMono,
            color: style.textSecondary,
          }}
        >
          <div className="flex flex-wrap items-center gap-2 truncate">
            <span className="font-semibold" style={{ color: style.textPrimary }}>
              Ubuntu Home Server:
            </span>
            {identity.subdomains.map((sub, i) => (
              <React.Fragment key={sub.url}>
                {i > 0 && <span aria-hidden="true">·</span>}
                <a
                  href={sub.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline"
                  style={{ color: style.accentPrimary }}
                >
                  {sub.label}
                </a>
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={`mailto:${identity.email}`}
              onClick={(e) => e.stopPropagation()}
              className="hover:underline"
              style={{ color: style.textPrimary }}
            >
              {identity.email}
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={identity.github}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline"
              style={{ color: style.textPrimary }}
            >
              GitHub
            </a>
            <span aria-hidden="true">·</span>
            <a
              href={identity.linkedin}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="hover:underline"
              style={{ color: style.textPrimary }}
            >
              LinkedIn
            </a>
          </div>
        </footer>
      </div>
    </main>
  );
};
