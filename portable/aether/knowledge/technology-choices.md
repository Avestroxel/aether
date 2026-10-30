# Technology decisions for motion and spatial UI

Inventory the project framework, dependencies, package manager and browser targets before proposing a package. The absence of a dependency is not a reason to add it. Check current licenses, security advisories, maintenance, and bundle size from primary sources before installing. AETHER's `resources --capability motion|3d|components` provides offline leads and detects declared dependencies, not a live security review.

## Motion: smallest adequate tool

| Need | First option | Escalate when justified |
| --- | --- | --- |
| Hover, focus, disclosure, simple transition | CSS transitions and native `prefers-reduced-motion` | Web Animations API for orchestrated imperative timelines |
| Enter/reorder/exit in React | Existing project animation utility | Motion (formerly Framer Motion) for layout/gesture transitions, React Spring for spring-driven interaction |
| Discrete entry/exit on scroll | IntersectionObserver + CSS, or CSS scroll-driven animations with support/fallback checks | GSAP ScrollTrigger or an existing timeline system only for coordinated pinning/scrubbing and reverse travel |
| Scroll behavior | Native scrolling and anchors; CSS `scroll-behavior` only where appropriate | Lenis only when custom scroll is essential; preserve anchors, keyboard, browser restoration and reduced motion |
| List insertion/reorder | Platform or existing framework transitions | AutoAnimate for simple DOM-driven changes |
| SVG/vector choreography | CSS or Web Animations API | Anime.js for timelines; Lottie for pre-rendered animations; Rive for stateful interactive authored artwork |

Decision sequence: identify the state changes and whether they are discrete, progress-linked or physics-driven; check an existing project solution; compare native/CSS, Web Animations API, then a library only for a gap you can name. Motion suits React layout/exit/gesture orchestration, React Spring for spring-state interactions, GSAP for complex timelines, and Lenis for deliberately custom scroll feel; these are candidates, not a stack to install together. For each candidate record framework/browser fit, licensing and maintenance checked from current primary sources, shipped bytes, teardown and reduced-motion strategy. Avoid coupling a scroll library to a 3D renderer unless that interaction actually improves the task.

Never enable multiple scroll controllers accidentally. Cancel animation on unmount, avoid infinite animation on content, and respect `prefers-reduced-motion`. Test focus, touch, reverse travel and scroll restoration; measure input responsiveness, not just frame rate.

## 3D: only if it earns its cost

| Need | Candidate | Caveat |
| --- | --- | --- |
| Static depth/tilt | CSS perspective or authored illustration | Avoid WebGL when pixels communicate the same information |
| Single custom scene in vanilla JS | Three.js | Own camera, renderer, context loss, cleanup and responsive framing |
| React scene | React Three Fiber; Drei for specific helpers | Three.js still underlies rendering; avoid importing every helper |
| Existing authored interactive model | Spline embed/runtime | Check terms, asset provenance, privacy, load size and fallback |
| Directed cinematic sequences | Theatre.js with existing renderer | Add only if timeline authoring is a real requirement |
| Postprocessing | React Postprocessing or renderer-native pipeline | GPU budget and contrast require measurement |
| Shader effect | GLSL/WebGL; WebGPU only for compatible targets | Provide WebGL/CSS/static fallback, handle device loss |

Before implementation, set a load/render budget and specify camera, controls, lights, materials, GLB/GLTF compression, texture dimensions, loading poster and semantic alternative. Pause offscreen rendering; respect battery and reduced motion; dispose GPU resources. Test no-WebGL and low-powered/mobile devices. Never gate critical text or checkout on canvas availability.
