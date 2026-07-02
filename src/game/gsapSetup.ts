/**
 * GSAP for the game island: every plugin registered once, custom eases
 * created once. Components import { gsap, useGSAP } from here so the
 * registration can never be forgotten.
 */
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { MorphSVGPlugin } from 'gsap/MorphSVGPlugin';
import { Physics2DPlugin } from 'gsap/Physics2DPlugin';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { CustomEase } from 'gsap/CustomEase';
import { CustomWiggle } from 'gsap/CustomWiggle';
import { CustomBounce } from 'gsap/CustomBounce';

gsap.registerPlugin(
  useGSAP,
  DrawSVGPlugin,
  MotionPathPlugin,
  MorphSVGPlugin,
  Physics2DPlugin,
  ScrambleTextPlugin,
  CustomEase,
  CustomWiggle,
  CustomBounce,
);

// Named eases (guarded so HMR doesn't re-create them).
if (!CustomEase.get('bitWiggle')) CustomWiggle.create('bitWiggle', { wiggles: 5, type: 'easeOut' });
if (!CustomEase.get('bitBounce')) CustomBounce.create('bitBounce', { strength: 0.55, squash: 2 });

export const reduceMotion = (): boolean =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

export { gsap, useGSAP };
