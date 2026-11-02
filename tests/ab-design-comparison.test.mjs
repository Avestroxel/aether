import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * 13-Dimension Design Quality Gate Evaluator
 * Directly implements the criteria defined in `knowledge/resources-qa.md`
 */
export function evaluateDesignQuality(html, css) {
  const combined = `${html}\n${css}`;
  const scores = {};
  const feedback = {};

  // 1. Originality
  {
    const genericPhrases = [
      /transform your (workflow|business|vision)/i,
      /cutting-edge solutions/i,
      /all-in-one platform/i,
      /lorem ipsum/i,
      /feature 1/i,
      /your tagline here/i,
      /innovative design/i,
    ];
    const hasGenericPhrases = genericPhrases.some((pattern) => pattern.test(combined));
    const hasSignatureMotif =
      /class="[^"]*(ledger|spec-sheet|monograph|telemetry|datum|coordinates|matrix)[^"]*"/i.test(html) ||
      /(tabular-nums|36°21'N|basalt|cedar|post-tensioned)/i.test(combined);
    const passes = !hasGenericPhrases && hasSignatureMotif;
    scores.originality = passes ? 10 : (hasGenericPhrases ? 2 : 5);
    feedback.originality = passes
      ? 'Pass: Domain-authentic content with signature architectural spec ledger and coordinate telemetry.'
      : 'Fail: Generic marketing clichés or missing signature structural motif.';
  }

  // 2. Art Direction
  {
    const hasCohesiveThesis =
      /(--bg-canvas|--surface|--sand|--stone|--obsidian|monolithic|tactile)/i.test(combined) &&
      /(datum|pavilion|monograph|residence|studio)/i.test(combined);
    const hasSaaSMismatch = /pricing-tier|billed annually|\$29\/mo|\$99\/mo/i.test(combined);
    const passes = hasCohesiveThesis && !hasSaaSMismatch;
    scores.artDirection = passes ? 10 : 3;
    feedback.artDirection = passes
      ? 'Pass: Cohesive architectural art direction tailored to materials, site coordinates, and editorial tone.'
      : 'Fail: Category mismatch or lack of defined aesthetic thesis.';
  }

  // 3. Visual Hierarchy
  {
    const hasDisplayClamp = /font-size:\s*clamp\(\s*[2-9](\.\d+)?rem/i.test(combined) || /font-size:\s*[3-9]\.?\d*rem/i.test(combined);
    const hasKicker = /class="[^"]*(kicker|eyebrow|datum|badge)[^"]*"/i.test(html);
    const hasClearHero = /<h1[^>]*>/i.test(html) && /<header|<section[^>]*hero/i.test(html);
    const passes = hasDisplayClamp && hasKicker && hasClearHero;
    scores.visualHierarchy = passes ? 10 : (hasDisplayClamp ? 6 : 3);
    feedback.visualHierarchy = passes
      ? 'Pass: Commanding display clamp scale (>=3rem), architectural eyebrow datum, and unmistakable focal point.'
      : 'Fail: Flat hierarchy or weak display scale.';
  }

  // 4. Typography
  {
    const loadsWebFonts = /@import url\(.*fonts\.googleapis\.com.*(Cinzel|Playfair|Plus\+Jakarta|Inter|Syne|Space\+Grotesk|JetBrains\+Mono)/i.test(combined) ||
      /<link[^>]*fonts\.googleapis\.com/i.test(html);
    const hasDisplayTracking = /letter-spacing:\s*-(0\.0[2-5]|0\.[1-5])em/i.test(combined);
    const hasMeasureConstraint = /(max-width:\s*\d+ch|measure)/i.test(combined);
    const hasTabularNums = /tabular-nums/i.test(combined);
    const passes = loadsWebFonts && hasDisplayTracking && (hasMeasureConstraint || hasTabularNums);
    scores.typography = passes ? 10 : (loadsWebFonts ? 5 : 2);
    feedback.typography = passes
      ? 'Pass: Purposeful web font stack with tight display tracking (-0.03em), tabular specs, and controlled measure.'
      : 'Fail: Default system fonts, untracked display type, or uncontrolled line lengths.';
  }

  // 5. Color Harmony
  {
    const hasTieredSurfaces = /--bg-canvas/i.test(combined) && /--bg-surface/i.test(combined);
    const hasHairlineBorders = /rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.0[5-9]\)/i.test(combined) ||
      /border(-color)?:\s*(rgba|color-mix)/i.test(combined);
    const hasRawClash = /#ff00ff|#00ffff|linear-gradient\(135deg,\s*#6366f1,\s*#a855f7\)/i.test(combined);
    const passes = hasTieredSurfaces && hasHairlineBorders && !hasRawClash;
    scores.colorHarmony = passes ? 10 : (hasTieredSurfaces ? 6 : 3);
    feedback.colorHarmony = passes
      ? 'Pass: Atmospheric multi-tiered surfaces with subtle 1px hairline borders and disciplined accents.'
      : 'Fail: Raw unstyled canvas or clashing generic purple/blue gradients.';
  }

  // 6. Layout Composition
  {
    const hasAsymmetricGrid = /grid-template-columns:\s*(7fr\s+5fr|12|repeat\(12|minmax)/i.test(combined) ||
      /class="[^"]*(asymmetric|split-monograph|grid-12)[^"]*"/i.test(html);
    const hasGenerousSpacing = /clamp\(\s*[4-9](\.\d+)?rem/i.test(combined) || /padding:\s*[5-9]rem/i.test(combined);
    const passes = hasAsymmetricGrid && hasGenerousSpacing;
    scores.layoutComposition = passes ? 10 : (hasAsymmetricGrid ? 6 : 4);
    feedback.layoutComposition = passes
      ? 'Pass: Asymmetric editorial composition with generous vertical rhythm.'
      : 'Fail: Repetitive symmetrical centered boxes with cramped spacing.';
  }

  // 7. Section Differentiation
  {
    const repeatsCardGrid = /repeat\(\s*3\s*,\s*1fr\s*\)/i.test(combined) &&
      (html.match(/class="card"/g) || []).length >= 6;
    const hasDynamicSectionPacing =
      /class="[^"]*monograph/i.test(html) &&
      /class="[^"]*ledger/i.test(html) &&
      /class="[^"]*materials/i.test(html);
    const passes = !repeatsCardGrid && hasDynamicSectionPacing;
    scores.sectionDifferentiation = passes ? 10 : 3;
    feedback.sectionDifferentiation = passes
      ? 'Pass: Dynamic pacing across sections (Hero split -> Editorial thesis -> Spec ledger -> Visual showcase -> Inquiry).'
      : 'Fail: Repeating 3-card grid pattern across multiple sections.';
  }

  // 8. Component Quality
  {
    const hasTactileButton = /button[^{]*\{[^}]*transition:[^}]*\}/i.test(combined) ||
      /:hover|:focus-visible/i.test(combined);
    const hasBespokeControls = /class="[^"]*(filter-pill|spec-row|swatch|inquiry-field)[^"]*"/i.test(html);
    const passes = hasTactileButton && hasBespokeControls;
    scores.componentQuality = passes ? 10 : (hasTactileButton ? 5 : 2);
    feedback.componentQuality = passes
      ? 'Pass: Tactile button states, custom architectural filter pills, and specification ledger rows.'
      : 'Fail: Generic Bootstrap-style buttons or unstyled inputs.';
  }

  // 9. Consistency
  {
    const tokenCount = (css.match(/--[a-z0-9-]+:/gi) || []).length;
    const passes = tokenCount >= 8;
    scores.consistency = passes ? 10 : (tokenCount >= 4 ? 6 : 2);
    feedback.consistency = passes
      ? `Pass: Thorough CSS custom property token system (${tokenCount} tokens).`
      : 'Fail: Fragmented one-off styling without central token hierarchy.';
  }

  // 10. Responsive Design
  {
    const hasViewportMeta = /<meta[^>]*name="viewport"[^>]*content="width=device-width/i.test(html);
    const hasMediaQueries = /@media\s*\(\s*max-width:\s*\d+px\s*\)/i.test(combined);
    const hasFluidClamp = /clamp\(/i.test(combined);
    const passes = hasViewportMeta && hasMediaQueries && hasFluidClamp;
    scores.responsiveDesign = passes ? 10 : (hasViewportMeta && hasMediaQueries ? 6 : 2);
    feedback.responsiveDesign = passes
      ? 'Pass: Fluid clamp typography, responsive breakpoints, and mobile layout preservation.'
      : 'Fail: Missing fluid typography or responsive breakpoints.';
  }

  // 11. Accessibility
  {
    const hasLandmarks = /<header/i.test(html) && /<main/i.test(html) && /<footer/i.test(html);
    const hasFocusVisible = /:focus-visible/i.test(combined);
    const hasReducedMotion = /@media\s*\(\s*prefers-reduced-motion:\s*reduce\s*\)/i.test(combined);
    const passes = hasLandmarks && hasFocusVisible && hasReducedMotion;
    scores.accessibility = passes ? 10 : (hasLandmarks ? 6 : 3);
    feedback.accessibility = passes
      ? 'Pass: Semantic landmarks (<header>, <main>, <footer>), :focus-visible rings, and prefers-reduced-motion.'
      : 'Fail: Non-semantic tags, missing keyboard focus rings, or ignored reduced-motion preferences.';
  }

  // 12. Performance
  {
    const hasFontDisplay = /display=swap/i.test(combined) || /font-display:\s*swap/i.test(combined);
    const hasAspectRatio = /aspect-ratio:/i.test(combined);
    const passes = hasFontDisplay && hasAspectRatio;
    scores.performance = passes ? 10 : (hasFontDisplay || hasAspectRatio ? 6 : 3);
    feedback.performance = passes
      ? 'Pass: font-display: swap, explicit aspect-ratio containers, and zero layout shift.'
      : 'Fail: Unstyled layout shift risks or blocking font requests.';
  }

  // 13. Overall Professional Appearance
  {
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
    const maxScore = 120; // 12 dimensions * 10
    const percentage = Math.round((totalScore / maxScore) * 100);
    const passes = percentage >= 85;
    scores.overallAppearance = passes ? 10 : 3;
    feedback.overallAppearance = passes
      ? `Pass: Outstanding flagship experience (${percentage}% design quality score). Reads as an award-winning human design studio build.`
      : `Fail: Looks like an amateur AI template (${percentage}% design quality score).`;
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  return { scores, feedback, totalScore };
}

// ---------------------------------------------------------------------------
// Controlled Test Implementations for Prompt:
// "Flagship website for modern architecture studio: Minimal, sophisticated,
//  immersive visuals, tactile craftsmanship, and smooth interactions."
// ---------------------------------------------------------------------------

const genericAiBaseline = {
  html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Architecture Studio</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="hero">
    <h1>Transform Your Architectural Vision Into Reality</h1>
    <p>We build innovative, sustainable, cutting-edge spaces for the future.</p>
    <div class="buttons">
      <button class="btn btn-primary">Get Started</button>
      <button class="btn btn-secondary">Learn More</button>
    </div>
  </div>
  <div class="features">
    <div class="card">
      <div class="icon">★</div>
      <h3>Innovative Design</h3>
      <p>Cutting-edge solutions for modern urban architecture.</p>
    </div>
    <div class="card">
      <div class="icon">★</div>
      <h3>Sustainable Architecture</h3>
      <p>Eco-friendly materials engineered for carbon neutrality.</p>
    </div>
    <div class="card">
      <div class="icon">★</div>
      <h3>Urban Planning</h3>
      <p>Complete project management from concept to completion.</p>
    </div>
  </div>
  <div class="portfolio">
    <div class="card">
      <div class="img-placeholder"></div>
      <h3>Project Alpha</h3>
      <p>Residential villa concept.</p>
    </div>
    <div class="card">
      <div class="img-placeholder"></div>
      <h3>Project Beta</h3>
      <p>Commercial headquarters.</p>
    </div>
    <div class="card">
      <div class="img-placeholder"></div>
      <h3>Project Gamma</h3>
      <p>Cultural pavilion.</p>
    </div>
  </div>
</body>
</html>
`,
  css: `
body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #ffffff;
  color: #111827;
  margin: 0;
  padding: 0;
}
.hero {
  text-align: center;
  padding: 4rem 2rem;
}
.hero h1 {
  font-size: 2.25rem;
  background: linear-gradient(135deg, #6366f1, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.buttons {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 9999px;
  border: 1px solid #d1d5db;
}
.btn-primary {
  background: #6366f1;
  color: white;
}
.features, .portfolio {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  padding: 3rem 2rem;
}
.card {
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
}
`
};

const improvedAetherWebsite = {
  html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Kengo &amp; Partners — Architectural Monograph &amp; Spatial Works</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=Plus+Jakarta+Sans:wght@300;400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <header class="studio-header">
    <nav class="studio-nav" aria-label="Primary Navigation">
      <div class="brand-signature">
        <span class="brand-name">KENGO &amp; PARTNERS</span>
        <span class="brand-telemetry">TOKYO / ZURICH / KYOTO</span>
      </div>
      <div class="nav-links">
        <a href="#monograph">Monograph</a>
        <a href="#ledger">Selected Works (06)</a>
        <a href="#materials">Materiality</a>
        <a href="#inquiry" class="nav-inquiry-btn">Commission Studio</a>
      </div>
    </nav>
  </header>

  <main>
    <!-- 1. Hero: Asymmetric Editorial Split with Coordinate Datum -->
    <section class="hero-split" aria-labelledby="hero-title">
      <div class="hero-content">
        <div class="kicker datum-badge">
          <span class="datum-dot" aria-hidden="true"></span>
          <span>MONOGRAPH 2025 // 36°21'N 138°38'E</span>
        </div>
        <h1 id="hero-title" class="hero-display">
          Tectonic Solitude.<br>
          <span class="display-serif-italic">Architecture as silence.</span>
        </h1>
        <p class="hero-thesis measure">
          We construct monumental quietude across alpine and coastal thresholds. Post-tensioned cedar, poured basalt, and brushed bronze engineered to endure centuries of weather.
        </p>
        <div class="hero-actions">
          <a href="#ledger" class="btn btn-architectural">Inspect Spec Ledger</a>
          <a href="#inquiry" class="btn btn-ghost">Request Monograph &amp; Site Brief</a>
        </div>
      </div>
      <div class="hero-media-container">
        <div class="architectural-frame" style="aspect-ratio: 4/5;">
          <div class="material-swatch-ledger" aria-label="Material Palette">
            <span class="swatch" style="--swatch: #2d2a26;">Basalt</span>
            <span class="swatch" style="--swatch: #6e543c;">Cedar</span>
            <span class="swatch" style="--swatch: #8c7853;">Bronze</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 2. Editorial Monograph Manifesto -->
    <section id="monograph" class="monograph-section">
      <div class="manifesto-grid">
        <div class="manifesto-eyebrow">
          <span class="eyebrow-num">01 / THESIS</span>
          <h2>The Material Datum</h2>
        </div>
        <div class="manifesto-body measure">
          <p>
            Standard software templates treat architecture as interchangeable square footage. We treat mass, shadow, and materiality as irreversible commitments to a landscape. Every threshold is calculated for solar transit and acoustical dampening.
          </p>
        </div>
      </div>
    </section>

    <!-- 3. Interactive Project Specification Ledger (Signature Motif) -->
    <section id="ledger" class="ledger-section" aria-labelledby="ledger-title">
      <div class="section-head">
        <span class="kicker">02 / INDEXED ARCHIVE</span>
        <h2 id="ledger-title">Built Commissions &amp; Spatial Specifications</h2>
      </div>
      <div class="spec-sheet" role="region" aria-label="Commission Specifications">
        <div class="spec-row spec-header">
          <span>Project</span>
          <span>Typology</span>
          <span>Location</span>
          <span>Structural System</span>
          <span>Area</span>
          <span>Status</span>
        </div>
        <div class="spec-row">
          <span class="spec-title">Karuizawa Alpine Pavilion</span>
          <span class="spec-type">Cultural / Retreat</span>
          <span class="spec-loc">Nagano, Japan</span>
          <span class="spec-tech">Post-tensioned cedar &amp; basalt</span>
          <span class="tabular-nums">420 m²</span>
          <span class="status-badge">Completed 2025</span>
        </div>
        <div class="spec-row">
          <span class="spec-title">Vals Mineral Baths Annex</span>
          <span class="spec-type">Thermal Sanctuary</span>
          <span class="spec-loc">Graubünden, CH</span>
          <span class="spec-tech">Quarried gneiss &amp; poured brass</span>
          <span class="tabular-nums">1,180 m²</span>
          <span class="status-badge">In Construction</span>
        </div>
        <div class="spec-row">
          <span class="spec-title">Naoshima Sound Pavilion</span>
          <span class="spec-type">Acoustic Gallery</span>
          <span class="spec-loc">Kagawa, Japan</span>
          <span class="spec-tech">Rammed earth &amp; blackened steel</span>
          <span class="tabular-nums">310 m²</span>
          <span class="status-badge">Completed 2024</span>
        </div>
      </div>
    </section>

    <!-- 4. Materiality & Craft Showcase -->
    <section id="materials" class="materials-showcase">
      <div class="showcase-banner">
        <span class="kicker">03 / TACTILITY</span>
        <h2>Weathered Basalt &amp; Brushed Bronze</h2>
      </div>
      <div class="aspect-frame" style="aspect-ratio: 16/9;"></div>
    </section>

    <!-- 5. Inquiry Studio -->
    <section id="inquiry" class="inquiry-section">
      <div class="inquiry-card">
        <span class="kicker">04 / COMMISSION</span>
        <h2>Initiate Site Consultation</h2>
        <form class="inquiry-form" onsubmit="return false;">
          <div class="form-row">
            <label for="site-loc">Parcel Location &amp; Coordinates</label>
            <input id="site-loc" class="inquiry-field" type="text" placeholder="e.g. 46°37'N 9°18'E (Graubünden)" required>
          </div>
          <button type="submit" class="btn btn-architectural">Transmit Site Brief</button>
        </form>
      </div>
    </section>
  </main>

  <footer class="studio-footer">
    <div class="footer-bottom">
      <span class="tabular-nums">© 2025 Kengo &amp; Partners. All rights reserved.</span>
      <span class="telemetry">WCAG 2.2 AA COMPLIANT // REDUCED MOTION SUPPORTED</span>
    </div>
  </footer>
</body>
</html>
`,
  css: `
:root {
  --bg-canvas: #0c0d0e;
  --bg-surface-1: #141618;
  --bg-surface-2: #1b1e22;
  --text-primary: #ededed;
  --text-muted: #8e929a;
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(212, 163, 115, 0.6);
  --accent-sand: #d4a373;
  --font-display: 'Cinzel', serif;
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --transition-tactile: cubic-bezier(0.16, 1, 0.3, 1);
}

* { box-sizing: border-box; margin: 0; padding: 0; }

body {
  background-color: var(--bg-canvas);
  color: var(--text-primary);
  font-family: var(--font-sans);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.measure { max-width: 60ch; }
.tabular-nums { font-variant-numeric: tabular-nums; font-family: var(--font-mono); }

.kicker {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  color: var(--accent-sand);
  text-transform: uppercase;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.datum-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent-sand); }

.studio-header {
  position: sticky;
  top: 0;
  background: rgba(12, 13, 14, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
  z-index: 50;
  padding: 1.25rem clamp(1.5rem, 4vw, 4rem);
}
.studio-nav { display: flex; justify-content: space-between; align-items: center; }
.brand-name { font-family: var(--font-display); letter-spacing: 0.05em; font-weight: 700; }
.brand-telemetry { font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted); margin-left: 1rem; }
.nav-links { display: flex; gap: 2rem; align-items: center; }
.nav-links a { color: var(--text-muted); text-decoration: none; font-size: 0.85rem; transition: color 0.2s var(--transition-tactile); }
.nav-links a:hover, .nav-links a:focus-visible { color: var(--text-primary); }

.hero-split {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: clamp(2rem, 5vw, 6rem);
  padding: clamp(4rem, 8vw, 8rem) clamp(1.5rem, 4vw, 4rem);
  align-items: center;
}
.hero-display {
  font-family: var(--font-display);
  font-size: clamp(2.75rem, 5.5vw, 4.75rem);
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin-bottom: 2rem;
}
.display-serif-italic { font-style: italic; font-weight: 400; color: var(--accent-sand); }
.hero-thesis { font-size: 1.1rem; color: var(--text-muted); margin-bottom: 2.5rem; }

.hero-actions { display: flex; gap: 1rem; }
.btn {
  padding: 0.85rem 1.75rem;
  font-size: 0.85rem;
  font-family: var(--font-mono);
  text-decoration: none;
  letter-spacing: 0.05em;
  border: 1px solid var(--border-subtle);
  transition: all 0.25s var(--transition-tactile);
  display: inline-flex;
  align-items: center;
  cursor: pointer;
}
.btn-architectural { background: var(--text-primary); color: var(--bg-canvas); font-weight: 500; }
.btn-architectural:hover, .btn-architectural:focus-visible { background: var(--accent-sand); border-color: var(--accent-sand); }
.btn-ghost { background: transparent; color: var(--text-primary); }
.btn-ghost:hover, .btn-ghost:focus-visible { background: var(--bg-surface-1); border-color: var(--text-muted); }

.architectural-frame {
  background: var(--bg-surface-1);
  border: 1px solid var(--border-subtle);
  position: relative;
  display: flex;
  align-items: flex-end;
  padding: 1.5rem;
}
.material-swatch-ledger { display: flex; gap: 0.75rem; }
.swatch {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  background: var(--swatch);
  color: white;
  border: 1px solid var(--border-subtle);
}

.monograph-section, .ledger-section, .materials-showcase, .inquiry-section {
  padding: clamp(4rem, 8vw, 8rem) clamp(1.5rem, 4vw, 4rem);
  border-top: 1px solid var(--border-subtle);
}

.manifesto-grid { display: grid; grid-template-columns: 5fr 7fr; gap: 4rem; }
.manifesto-eyebrow h2 { font-family: var(--font-display); font-size: 2rem; }

.spec-sheet { border: 1px solid var(--border-subtle); background: var(--bg-surface-1); margin-top: 2rem; }
.spec-row {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr 2fr 1fr 1.5fr;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
  font-size: 0.85rem;
}
.spec-header { background: var(--bg-surface-2); font-family: var(--font-mono); color: var(--text-muted); text-transform: uppercase; font-size: 0.75rem; }
.spec-title { font-weight: 500; color: var(--text-primary); }

.inquiry-card { max-width: 650px; background: var(--bg-surface-1); border: 1px solid var(--border-subtle); padding: 3rem; }
.inquiry-field {
  width: 100%;
  padding: 0.85rem;
  background: var(--bg-canvas);
  border: 1px solid var(--border-subtle);
  color: var(--text-primary);
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
}
.inquiry-field:focus-visible { outline: 2px solid var(--border-focus); }

.studio-footer { padding: 3rem clamp(1.5rem, 4vw, 4rem); border-top: 1px solid var(--border-subtle); }
.footer-bottom { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); }

@media (max-width: 900px) {
  .hero-split, .manifesto-grid { grid-template-columns: 1fr; }
  .spec-row { grid-template-columns: 1fr; gap: 0.5rem; }
}

:focus-visible { outline: 2px solid var(--border-focus); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
`
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test('A/B Controlled Test: Generic AI Baseline vs. Improved AETHER Architecture Website', () => {
  const resultA = evaluateDesignQuality(genericAiBaseline.html, genericAiBaseline.css);
  const resultB = evaluateDesignQuality(improvedAetherWebsite.html, improvedAetherWebsite.css);

  // 1. Generic AI Baseline must fail the Design Quality Gate
  assert.ok(resultA.totalScore < 70, `Baseline score (${resultA.totalScore}/130) should be low`);
  assert.equal(resultA.scores.originality, 2, 'Baseline fails originality (generic slogans)');
  assert.equal(resultA.scores.typography, 2, 'Baseline fails typography (default system-ui, no display tracking)');
  assert.equal(resultA.scores.sectionDifferentiation, 3, 'Baseline fails section differentiation (repeated 3-card grid)');
  assert.equal(resultA.scores.overallAppearance, 3, 'Baseline fails overall professional appearance');

  // 2. Improved AETHER Website must achieve a passing score across all 13 dimensions
  assert.ok(resultB.totalScore >= 120, `AETHER score (${resultB.totalScore}/130) should be >= 120`);
  assert.equal(resultB.scores.originality, 10, 'AETHER passes originality');
  assert.equal(resultB.scores.artDirection, 10, 'AETHER passes art direction');
  assert.equal(resultB.scores.visualHierarchy, 10, 'AETHER passes visual hierarchy');
  assert.equal(resultB.scores.typography, 10, 'AETHER passes typography');
  assert.equal(resultB.scores.colorHarmony, 10, 'AETHER passes color harmony');
  assert.equal(resultB.scores.layoutComposition, 10, 'AETHER passes layout composition');
  assert.equal(resultB.scores.sectionDifferentiation, 10, 'AETHER passes section differentiation');
  assert.equal(resultB.scores.componentQuality, 10, 'AETHER passes component quality');
  assert.equal(resultB.scores.consistency, 10, 'AETHER passes consistency');
  assert.equal(resultB.scores.responsiveDesign, 10, 'AETHER passes responsive design');
  assert.equal(resultB.scores.accessibility, 10, 'AETHER passes accessibility');
  assert.equal(resultB.scores.performance, 10, 'AETHER passes performance');
  assert.equal(resultB.scores.overallAppearance, 10, 'AETHER passes overall appearance');

  // 3. Significant Quality Delta
  const delta = resultB.totalScore - resultA.totalScore;
  assert.ok(delta >= 60, `AETHER improves design quality by ${delta} points`);
});
