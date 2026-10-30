# Interaction, motion and 3D

## Interaction first

Every gesture should have a visible affordance, feedback and recovery path. Build navigation, forms and disclosure with semantic HTML or proven accessible primitives. Specify what happens while waiting, after success, on empty data and on failure. Never make hover the only way to discover essential information; touch and keyboard need equivalent access. Start silent by default: do not autoplay audio, force smooth scrolling or add perpetual ambient animation. A quiet interface can still have clear immediate feedback.

For a menu, panel or route change, map **closed → opening → open → closing → closed** with focus target, Escape, outside dismissal where appropriate and rapid reversal. The latest intent should win; exiting layers must not intercept clicks or retain focus when hidden. Navigate with links, activate state with buttons. Motion is not a substitute for a status message.

## Motion with a purpose

Classify motion as feedback (button response), orientation (panel transition), continuity (reordering) or narrative (illustration). For each, state the information it conveys and the non-motion equivalent. Use short transitions for microfeedback (often 100–250 ms) and longer only if distance/complexity warrants it. Avoid animating large layout properties when transform/opacity can do the job, but don't change semantics to force GPU effects. No flashing more than three times per second. Respect `prefers-reduced-motion`: remove parallax, auto-motion and camera travel or replace them with immediate state changes; don't remove essential status feedback.

For scrolling, specify **before, enter, active, exit, reverse/re-enter** states per section. Discrete reveals may use IntersectionObserver; scrubbed effects need one progress source and must unwind in reverse without snapping. Keep essential content visible without JS and on mid-page reload. Pinning must not trap input or obscure anchors; reserve space and refresh measurements after layout changes. Test quick scroll, both directions, touch/keyboard, restored position and narrow/short viewports. Native scrolling is the baseline; one custom scroll controller at most, and only with a demonstrated need.

## 3D as a justified medium

Use 3D when shape, spatial relation or interaction teaches something a static image cannot. Storyboard the camera, lighting, material and interaction before choosing a renderer. Put critical copy and controls in semantic DOM outside the canvas. Provide a poster or still for unsupported devices, reduced motion and slow networks. Cap device pixel ratio and geometry/texture budgets; dispose unused buffers and stop rendering offscreen. Verify keyboard interaction, contrast against the scene, WebGL failure, camera interruption, reverse scroll if linked to scroll position and loading states. If a static image communicates the same thing faster and more accessibly, prefer the image.
