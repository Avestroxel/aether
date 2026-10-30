import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

export interface Candidate { name: string; capability: string; url: string; ecosystem: string; note: string }
export interface Recommendation extends Candidate { installed: boolean; compatible: boolean }
const catalog: Candidate[] = [
  { name: "CSS / Web Animations API", capability: "motion", url: "https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API", ecosystem: "web", note: "Start here for simple, accessible transitions without dependencies." },
  { name: "Motion", capability: "motion", url: "https://motion.dev/", ecosystem: "react", note: "Declarative React transitions, layout and gesture animation; verify current license and bundle impact." },
  { name: "GSAP", capability: "motion", url: "https://gsap.com/docs/v3/", ecosystem: "web", note: "Precise timeline choreography; check current licensing, runtime and reduced-motion support." },
  { name: "GSAP ScrollTrigger", capability: "motion", url: "https://gsap.com/docs/v3/Plugins/ScrollTrigger/", ecosystem: "web", note: "Scroll-scrubbed timelines and pinning when native options are insufficient; verify licensing and cleanup." },
  { name: "React Spring", capability: "motion", url: "https://www.react-spring.dev/", ecosystem: "react", note: "Spring-driven React transitions; compare to existing framework animation tools and bundle impact." },
  { name: "Lenis", capability: "motion", url: "https://lenis.darkroom.engineering/", ecosystem: "web", note: "Optional smooth scrolling; preserve native scroll, anchors, focus and reduced-motion behavior." },
  { name: "AutoAnimate", capability: "motion", url: "https://auto-animate.formkit.com/", ecosystem: "web", note: "Small layout-list transitions; test reduced motion and unmount cleanup." },
  { name: "View Transitions API", capability: "motion", url: "https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API", ecosystem: "web", note: "Native page/state transitions where supported, with a usable fallback." },
  { name: "Rive", capability: "motion", url: "https://rive.app/docs/", ecosystem: "web", note: "Interactive authored animation; check asset license and runtime cost." },
  { name: "Three.js", capability: "3d", url: "https://threejs.org/docs/", ecosystem: "web", note: "Direct WebGL scenes when 3D conveys product information; ship fallback and budget GPU time." },
  { name: "React Three Fiber", capability: "3d", url: "https://r3f.docs.pmnd.rs/", ecosystem: "react", note: "React-based 3D scenes; pair with Three.js, evaluate 3D necessity first." },
  { name: "Drei", capability: "3d", url: "https://drei.docs.pmnd.rs/", ecosystem: "react", note: "React Three Fiber helpers; use only required helpers." },
  { name: "Spline", capability: "3d", url: "https://spline.design/", ecosystem: "web", note: "Authored 3D embeds; review runtime, hosting, privacy and asset usage rights." },
  { name: "Native HTML", capability: "components", url: "https://developer.mozilla.org/en-US/docs/Web/HTML", ecosystem: "web", note: "Prefer semantic elements where platform behavior already suffices." },
  { name: "Radix UI", capability: "components", url: "https://www.radix-ui.com/primitives", ecosystem: "react", note: "Accessible unstyled React primitives; supply project-specific visual design." },
  { name: "shadcn/ui", capability: "components", url: "https://ui.shadcn.com/", ecosystem: "react", note: "Source components to adapt; inspect component licenses and avoid default styling." },
  { name: "Headless UI", capability: "components", url: "https://headlessui.com/", ecosystem: "react", note: "Unstyled interaction primitives; verify framework support and accessibility." },
  { name: "Awwwards", capability: "inspiration", url: "https://www.awwwards.com/", ecosystem: "web", note: "Study art direction, not copyrighted layouts or source code." },
  { name: "Codrops", capability: "inspiration", url: "https://tympanus.net/codrops/", ecosystem: "web", note: "Explore interaction techniques; check each demo's license." },
];
const deps: Record<string, string[]> = {
  Motion: ["motion", "framer-motion"], GSAP: ["gsap"], "GSAP ScrollTrigger": ["gsap"],
  "React Spring": ["@react-spring/web"], Lenis: ["lenis", "@studio-freight/lenis"], AutoAnimate: ["@formkit/auto-animate"], Rive: ["@rive-app/react-canvas", "@rive-app/canvas"],
  "Three.js": ["three"], "React Three Fiber": ["@react-three/fiber"], Drei: ["@react-three/drei"],
  Spline: ["@splinetool/react-spline"], "Radix UI": ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
  "shadcn/ui": ["@radix-ui/react-slot"], "Headless UI": ["@headlessui/react"],
};
async function exists(path: string): Promise<boolean> { try { await stat(path); return true; } catch (error) { if ((error as { code?: string }).code === "ENOENT") return false; throw error; } }

/** Offline discovery: no installs or remote requests. URLs are leads, never license guarantees. */
export async function discover(root: string, capability: string): Promise<{ manager: string; candidates: Recommendation[] }> {
  if (!["motion", "3d", "components", "inspiration"].includes(capability)) throw new Error("Capability must be motion, 3d, components or inspiration");
  const manager = (await exists(join(root, "pnpm-lock.yaml"))) ? "pnpm" : (await exists(join(root, "yarn.lock"))) ? "yarn" : (await exists(join(root, "bun.lockb")) || await exists(join(root, "bun.lock"))) ? "bun" : (await exists(join(root, "package-lock.json"))) ? "npm" : "undetected";
  let installed: Record<string, string> = {};
  try {
    const pkg = JSON.parse(await readFile(join(root, "package.json"), "utf8")) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
    installed = { ...pkg.dependencies, ...pkg.devDependencies };
  } catch (error) { if ((error as { code?: string }).code !== "ENOENT") throw error; }
  const react = Boolean(installed.react);
  const candidates = catalog.filter((item) => item.capability === capability).map((item) => ({ ...item, compatible: item.ecosystem !== "react" || react, installed: (deps[item.name] || []).some((name) => name in installed) }));
  candidates.sort((a, b) => Number(b.installed) - Number(a.installed) || Number(b.compatible) - Number(a.compatible));
  return { manager, candidates };
}
