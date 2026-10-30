---
name: 3d-design
description: Decide whether and how to use 3D in web experiences, including scene storytelling, interaction, fallback rendering, accessibility and GPU budgets.
---

# 3D design

Compare WebGL, authored scenes and CSS alternatives in [technology choices](../../knowledge/technology-choices.md) before choosing a renderer.

Use when a product visualization, spatial explanation or interactive scene is requested. Read [interaction, motion and 3D](../../knowledge/interaction-motion-3d.md), [performance](../../knowledge/performance.md), and [resource QA](../../knowledge/resources-qa.md).

1. State the spatial question the scene answers. Compare against a diagram, video or still; choose 3D only if it adds task value.
2. Storyboard camera, framing, materials, lighting, interaction and mobile composition. Specify scene enter/exit and reverse scroll state if linked to the page; ensure camera motion can be interrupted without trapping scroll. Keep labels, controls and critical text in semantic HTML outside the canvas.
3. Budget geometry, texture resolution, draw calls and device pixel ratio against target devices. Lazy-load noncritical scenes; suspend rendering when offscreen and dispose assets when unmounted. Prefer event-driven renders for static scenes; plan context-loss recovery and a static fallback.
4. Provide a meaningful poster/still for load failure, unsupported WebGL, reduced motion and constrained network. Verify license of models/textures, keyboard interaction, contrast, focus and touch alternatives.

Example: A rotatable chair model can reveal clearance dimensions; also provide annotated front/side stills and a text dimensions table. Deliver a decision rationale, scene spec, asset provenance, fallback and measured performance cost. Do not make checkout depend on a canvas.
