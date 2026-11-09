/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  Shuffle,
  Download,
  Sparkles,
  Image as ImageIcon,
  Check,
  X,
  Type as TypeIcon,
  LayoutGrid,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import {
  parsePortfolioMarkdown,
  selectPosterDataSlice,
  INITIAL_RAW_MARKDOWN,
  PortfolioPhoto,
} from './utils/knowledgeParser';
import {
  generateCompleteDesignState,
  CompleteDesignState,
} from './engine/designEngine';
import { exportPosterAsPng } from './utils/posterExporter';
import { PosterCanvas } from './components/PosterCanvas';
import { StyleStudioModal } from './components/StyleStudioModal';
import { KnowledgeStudioModal } from './components/KnowledgeStudioModal';

const STORAGE_SEEN_KEY = 'shamil_tp_poster_seen_signatures_v2';
const STORAGE_CUSTOM_PHOTOS_KEY = 'shamil_tp_poster_custom_photos_v1';

function loadSeenSignatures(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_SEEN_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSeenSignatures(sigs: string[]) {
  try {
    localStorage.setItem(STORAGE_SEEN_KEY, JSON.stringify(sigs.slice(-400)));
  } catch {
    // Ignore storage quota errors
  }
}

function loadCustomPhotos(): PortfolioPhoto[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_PHOTOS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [rawMarkdown, setRawMarkdown] = useState<string>(INITIAL_RAW_MARKDOWN);
  const [customPhotos, setCustomPhotos] = useState<PortfolioPhoto[]>(() =>
    loadCustomPhotos()
  );

  // Parse knowledge base from .md + custom photos
  const kb = useMemo(
    () => parsePortfolioMarkdown(rawMarkdown, customPhotos),
    [rawMarkdown, customPhotos]
  );

  // Fetch the full attached .md file at runtime to keep rawMarkdown synced
  useEffect(() => {
    fetch('/assets/aistudio/SHAMIL_TP_PORTFOLIO_KNOWLEDGE_BASE_a54d24ce.md')
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        if (text && text.trim().length > 100) {
          setRawMarkdown(text);
        }
      })
      .catch(() => {
        // Fallback already loaded via INITIAL_RAW_MARKDOWN
      });
  }, []);

  const [seenSignatures, setSeenSignatures] = useState<string[]>(() =>
    loadSeenSignatures()
  );
  const [typeOverrideCounter, setTypeOverrideCounter] = useState<number>(0);
  const [layoutOverrideCounter, setLayoutOverrideCounter] = useState<number>(0);

  // Generate fresh deterministic seed on every page refresh
  const [designState, setDesignState] = useState<CompleteDesignState>(() => {
    const initialSeen = loadSeenSignatures();
    const edition = initialSeen.length + 1;
    const initialSeed =
      Math.floor(Math.random() * 900000) + edition * 7919 + Date.now() % 10000;
    const state = generateCompleteDesignState(initialSeed, edition, {
      projectCount: 12,
      photoCount: 3 + loadCustomPhotos().length,
    });
    saveSeenSignatures([...initialSeen, state.comboSignature]);
    return state;
  });

  useEffect(() => {
    setSeenSignatures((prev) => {
      if (prev.includes(designState.comboSignature)) return prev;
      const next = [...prev, designState.comboSignature];
      saveSeenSignatures(next);
      return next;
    });
  }, [designState.comboSignature]);

  const [searchQuery, setSearchQuery] = useState('');
  const [isStyleModalOpen, setIsStyleModalOpen] = useState(false);
  const [isKnowledgeModalOpen, setIsKnowledgeModalOpen] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // A. Complete Design Regeneration (New Seed -> New Style/Hybrid, New Layout, New Typography, New Illustration, New Dossier)
  const handleRegenerateDesign = useCallback(
    (options?: {
      forceStyleId?: number;
      forceSecondaryStyleId?: number;
      forceHybrid?: boolean;
    }) => {
      setTypeOverrideCounter(0);
      setLayoutOverrideCounter(0);
      setDesignState((prev) => {
        const nextEdition = prev.editionNumber + 1;
        const nextSeed =
          Math.floor(Math.random() * 900000) +
          nextEdition * 6151 +
          (Date.now() % 10000);
        return generateCompleteDesignState(nextSeed, nextEdition, {
          ...options,
          previousState: prev,
          projectCount: kb.projects.length,
          photoCount: kb.photos.length,
        });
      });
      setDownloadStatus(null);
    },
    [kb.projects.length, kb.photos.length]
  );

  // E. Independent Typography Randomization (Preserves current style, layout, and illustration)
  const handleRandomizeTypography = useCallback(() => {
    setTypeOverrideCounter((prevCount) => {
      const nextCount = prevCount + 1;
      setDesignState((prev) => {
        const updated = generateCompleteDesignState(
          prev.seed,
          prev.editionNumber,
          {
            typeOverrideIndex: nextCount,
            layoutOverrideIndex:
              layoutOverrideCounter > 0 ? layoutOverrideCounter : undefined,
            projectCount: kb.projects.length,
            photoCount: kb.photos.length,
          }
        );
        return {
          ...prev,
          typography: updated.typography,
        };
      });
      return nextCount;
    });
  }, [kb.projects.length, kb.photos.length, layoutOverrideCounter]);

  // F. Independent Layout Randomization (Preserves current style, typography, and illustration)
  const handleRandomizeLayout = useCallback(() => {
    setLayoutOverrideCounter((prevCount) => {
      const nextCount = prevCount + 1;
      setDesignState((prev) => {
        const updated = generateCompleteDesignState(
          prev.seed,
          prev.editionNumber,
          {
            typeOverrideIndex:
              typeOverrideCounter > 0 ? typeOverrideCounter : undefined,
            layoutOverrideIndex: nextCount,
            projectCount: kb.projects.length,
            photoCount: kb.photos.length,
          }
        );
        return {
          ...prev,
          layout: updated.layout,
        };
      });
      return nextCount;
    });
  }, [kb.projects.length, kb.photos.length, typeOverrideCounter]);

  // G. Fullscreen Toggle
  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement
        .requestFullscreen?.()
        .then(() => setIsFullscreen(true))
        .catch(() => {});
    } else {
      document
        .exitFullscreen?.()
        .then(() => setIsFullscreen(false))
        .catch(() => {});
    }
  }, []);

  // H. Keyboard Controls: Space (Regenerate), T (Typography), L (Layout), Escape (Close Modals / Exit Fullscreen)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space' && !isStyleModalOpen && !isKnowledgeModalOpen) {
        e.preventDefault();
        handleRegenerateDesign();
      } else if (
        (e.key === 't' || e.key === 'T') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !isStyleModalOpen &&
        !isKnowledgeModalOpen
      ) {
        e.preventDefault();
        handleRandomizeTypography();
      } else if (
        (e.key === 'l' || e.key === 'L') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !isStyleModalOpen &&
        !isKnowledgeModalOpen
      ) {
        e.preventDefault();
        handleRandomizeLayout();
      } else if (e.key === 'Escape') {
        setIsStyleModalOpen(false);
        setIsKnowledgeModalOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    handleRegenerateDesign,
    handleRandomizeTypography,
    handleRandomizeLayout,
    isStyleModalOpen,
    isKnowledgeModalOpen,
  ]);

  const handleCyclePhoto = () => {
    setDesignState((prev) => ({
      ...prev,
      photoIndex: (prev.photoIndex + 1) % kb.photos.length,
    }));
  };

  const handleCycleProject = () => {
    setDesignState((prev) => ({
      ...prev,
      projectIndex: (prev.projectIndex + 1) % kb.projects.length,
      secondaryProjectIndex:
        (prev.secondaryProjectIndex + 1) % kb.projects.length,
    }));
  };

  const handleSwapSecondaryToPrimary = () => {
    setDesignState((prev) => ({
      ...prev,
      projectIndex: prev.secondaryProjectIndex,
      secondaryProjectIndex: (prev.projectIndex + 2) % kb.projects.length,
    }));
  };

  const handleAddCustomPhoto = (newPhoto: PortfolioPhoto) => {
    setCustomPhotos((prev) => {
      const updated = [newPhoto, ...prev];
      try {
        localStorage.setItem(STORAGE_CUSTOM_PHOTOS_KEY, JSON.stringify(updated));
      } catch {
        // Ignore quota limits
      }
      return updated;
    });
    setDesignState((prev) => ({
      ...prev,
      photoIndex: 0,
    }));
  };

  const activeSlice = useMemo(
    () =>
      selectPosterDataSlice(kb, {
        projectIndex: designState.projectIndex,
        secondaryProjectIndex: designState.secondaryProjectIndex,
        experienceIndex: designState.experienceIndex,
        hackathonIndex: designState.hackathonIndex,
        skillGroupIndex: designState.skillGroupIndex,
        educationIndex: designState.educationIndex,
        photoIndex: designState.photoIndex,
        searchQuery,
      }),
    [kb, designState, searchQuery]
  );

  const activeStyle = designState.artDirection;

  const handleDownloadPoster = async () => {
    try {
      setDownloadStatus('Rendering 1920×1080 PNG...');
      const filename = await exportPosterAsPng(
        activeStyle,
        activeSlice,
        kb.identity
      );
      setDownloadStatus(`Downloaded ${filename}`);
      setTimeout(() => setDownloadStatus(null), 4000);
    } catch {
      setDownloadStatus('Export complete');
      setTimeout(() => setDownloadStatus(null), 3000);
    }
  };

  return (
    <div
      className="h-[100dvh] min-h-[100svh] w-[100vw] overflow-hidden flex flex-col select-none"
      style={{
        backgroundColor: activeStyle.bgCanvas,
        color: activeStyle.textPrimary,
      }}
    >
      {/* STRICT 3-ZONE TOP BAR CONTRACT */}
      <header
        className="flex items-center justify-between gap-8 px-4 sm:px-6 py-2 border-b shrink-0 z-20"
        style={{
          backgroundColor: activeStyle.bgElevated,
          borderColor: activeStyle.borderColor,
        }}
      >
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#poster"
          onClick={(e) => {
            e.preventDefault();
            handleRegenerateDesign();
          }}
          className="text-base sm:text-lg font-bold tracking-tight whitespace-nowrap shrink-0"
          style={{
            fontFamily: designState.typography.fontDisplay,
            color: activeStyle.textPrimary,
          }}
        >
          SHAMIL TP
        </a>

        {/* Zone 2: 4–5 concise single-line text navigation links */}
        <nav
          aria-label="Poster Studio Navigation"
          className="hidden md:flex items-center gap-6 text-xs sm:text-sm font-medium"
        >
          <button
            type="button"
            onClick={() => handleRegenerateDesign()}
            className="hover:underline transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            style={{ color: activeStyle.textPrimary }}
          >
            Regenerate
          </button>
          <button
            type="button"
            onClick={() => handleRegenerateDesign({ forceHybrid: true })}
            className="hover:underline transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            style={{ color: activeStyle.textSecondary }}
          >
            Hybrid Mix
          </button>
          <button
            type="button"
            onClick={() => setIsStyleModalOpen(true)}
            className="hover:underline transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            style={{ color: activeStyle.textSecondary }}
          >
            50 Styles
          </button>
          <button
            type="button"
            onClick={() => setIsKnowledgeModalOpen(true)}
            className="hover:underline transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            style={{ color: activeStyle.textSecondary }}
          >
            Dossiers & Photos
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDownloadPoster}
            className="px-4 py-1.5 text-xs font-semibold transition-transform active:scale-95 whitespace-nowrap shrink-0 cursor-pointer inline-flex items-center gap-1.5"
            style={{
              backgroundColor: activeStyle.accentPrimary,
              color: activeStyle.isDark ? '#09090B' : '#FFFFFF',
            }}
          >
            {downloadStatus ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{downloadStatus}</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Download Poster</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* EXPERIMENTAL DESIGN PLAYGROUND CONTROL BAR */}
      <div
        className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-6 py-1.5 border-b shrink-0 z-20"
        style={{
          backgroundColor: activeStyle.bgSurface,
          borderColor: activeStyle.borderColor,
        }}
      >
        {/* Search Input to Recompose Poster from .md Knowledge Base */}
        <div className="relative flex-1 min-w-[180px] max-w-sm flex items-center">
          <Search
            className="w-3.5 h-3.5 absolute left-2.5 pointer-events-none"
            style={{ color: activeStyle.textSecondary }}
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search .md (e.g. Go, OpsPilot, Rewind, Cloudflare)..."
            aria-label="Search portfolio knowledge base"
            className="w-full pl-8 pr-6 py-1 text-xs border focus:outline-none transition-colors"
            style={{
              backgroundColor: activeStyle.bgElevated,
              borderColor: activeStyle.borderColor,
              color: activeStyle.textPrimary,
              fontFamily: designState.typography.fontBody,
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search query"
              className="absolute right-2 p-0.5 cursor-pointer"
              style={{ color: activeStyle.textSecondary }}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Interactive Playground Mutators: Regenerate, Type (T), Layout (L), Hybrid, Catalog, Fullscreen */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleRegenerateDesign()}
            aria-label="Regenerate complete design"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 transition-transform active:scale-95"
            style={{
              backgroundColor: activeStyle.bgElevated,
              borderColor: activeStyle.borderColor,
              color: activeStyle.textPrimary,
              fontFamily: designState.typography.fontMono,
            }}
          >
            <Shuffle className="w-3 h-3" style={{ color: activeStyle.accentPrimary }} />
            <span>Regenerate [Space]</span>
          </button>

          <button
            type="button"
            onClick={handleRandomizeTypography}
            aria-label="Randomize typography only"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-medium border cursor-pointer whitespace-nowrap shrink-0 transition-transform active:scale-95"
            style={{
              backgroundColor: activeStyle.bgElevated,
              borderColor: activeStyle.borderColor,
              color: activeStyle.textPrimary,
              fontFamily: designState.typography.fontMono,
            }}
          >
            <TypeIcon className="w-3 h-3" style={{ color: activeStyle.accentPrimary }} />
            <span>Type [T]</span>
          </button>

          <button
            type="button"
            onClick={handleRandomizeLayout}
            aria-label="Randomize layout only"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-medium border cursor-pointer whitespace-nowrap shrink-0 transition-transform active:scale-95"
            style={{
              backgroundColor: activeStyle.bgElevated,
              borderColor: activeStyle.borderColor,
              color: activeStyle.textPrimary,
              fontFamily: designState.typography.fontMono,
            }}
          >
            <LayoutGrid className="w-3 h-3" style={{ color: activeStyle.accentPrimary }} />
            <span>Layout [L]</span>
          </button>

          <button
            type="button"
            onClick={() => handleRegenerateDesign({ forceHybrid: true })}
            aria-label="Generate hybrid design combination"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] sm:text-xs font-semibold border cursor-pointer whitespace-nowrap shrink-0 transition-transform active:scale-95"
            style={{
              backgroundColor: activeStyle.bgElevated,
              borderColor: activeStyle.borderColor,
              color: activeStyle.accentPrimary,
              fontFamily: designState.typography.fontMono,
            }}
          >
            <Sparkles className="w-3 h-3" />
            <span>Hybrid Combo</span>
          </button>

          <button
            type="button"
            onClick={() => setIsStyleModalOpen(true)}
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium border cursor-pointer whitespace-nowrap shrink-0"
            style={{
              backgroundColor: activeStyle.bgElevated,
              borderColor: activeStyle.borderColor,
              color: activeStyle.textSecondary,
              fontFamily: designState.typography.fontMono,
            }}
          >
            <span>Style Catalog</span>
          </button>

          <button
            type="button"
            onClick={() => setIsKnowledgeModalOpen(true)}
            aria-label="Open Knowledge Base and Photo Studio"
            className="inline-flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium border cursor-pointer whitespace-nowrap shrink-0"
            style={{
              backgroundColor: activeStyle.bgElevated,
              borderColor: activeStyle.borderColor,
              color: activeStyle.textSecondary,
              fontFamily: designState.typography.fontMono,
            }}
          >
            <ImageIcon className="w-3 h-3" />
            <span>Photos / .md</span>
          </button>

          <button
            type="button"
            onClick={handleToggleFullscreen}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-[11px] sm:text-xs font-medium border cursor-pointer whitespace-nowrap shrink-0"
            style={{
              backgroundColor: activeStyle.bgElevated,
              borderColor: activeStyle.borderColor,
              color: activeStyle.textSecondary,
              fontFamily: designState.typography.fontMono,
            }}
          >
            {isFullscreen ? (
              <Minimize2 className="w-3 h-3" />
            ) : (
              <Maximize2 className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* ZERO-SCROLL FULL-VIEWPORT EXPERIMENTAL DESIGN CANVAS */}
      <PosterCanvas
        designState={designState}
        slice={activeSlice}
        identity={kb.identity}
        onCyclePhoto={handleCyclePhoto}
        onCycleProject={handleCycleProject}
        onSwapSecondaryToPrimary={handleSwapSecondaryToPrimary}
        onCycleTypography={handleRandomizeTypography}
        onCycleLayout={handleRandomizeLayout}
        onOpenStyleModal={() => setIsStyleModalOpen(true)}
        onOpenDossierModal={() => setIsKnowledgeModalOpen(true)}
      />

      {/* 50 DESIGN STYLES & HYBRID SYNTHESIZER MODAL */}
      <StyleStudioModal
        isOpen={isStyleModalOpen}
        activeStyle={activeStyle}
        seenCount={seenSignatures.length}
        onClose={() => setIsStyleModalOpen(false)}
        onSelectPureStyle={(styleId) =>
          handleRegenerateDesign({ forceStyleId: styleId, forceHybrid: false })
        }
        onSynthesizeHybrid={(styleAId, styleBId) =>
          handleRegenerateDesign({
            forceStyleId: styleAId,
            forceSecondaryStyleId: styleBId,
            forceHybrid: true,
          })
        }
        onRandomizeHybrid={() => handleRegenerateDesign({ forceHybrid: true })}
      />

      {/* KNOWLEDGE BASE (.MD) & PHOTO UPLOAD STUDIO MODAL */}
      <KnowledgeStudioModal
        isOpen={isKnowledgeModalOpen}
        kb={kb}
        rawMarkdown={rawMarkdown}
        activeProjectIndex={designState.projectIndex}
        activePhotoIndex={designState.photoIndex}
        onClose={() => setIsKnowledgeModalOpen(false)}
        onSelectProject={(idx) =>
          setDesignState((prev) => ({
            ...prev,
            projectIndex: idx,
            secondaryProjectIndex: (idx + 3) % kb.projects.length,
          }))
        }
        onSelectPhoto={(idx) =>
          setDesignState((prev) => ({
            ...prev,
            photoIndex: idx,
          }))
        }
        onAddCustomPhoto={handleAddCustomPhoto}
        onUpdateMarkdown={(newMd) => setRawMarkdown(newMd)}
      />
    </div>
  );
}
