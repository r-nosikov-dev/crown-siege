export interface GsapTimeline {
    to(target: object, vars: Record<string, unknown>, position?: string | number): GsapTimeline;
    kill(): void;
}

export interface Gsap {
    timeline(vars?: Record<string, unknown>): GsapTimeline;
    to(target: object, vars: Record<string, unknown>): unknown;
}

// Webpack alias resolves 'gsap' -> node_modules/gsap/dist/gsap.js
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mod = require('gsap') as { gsap?: Gsap; default?: Gsap };

const gsap: Gsap = (mod.gsap ?? mod.default ?? mod) as Gsap;

export default gsap;