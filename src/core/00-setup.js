import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';

window.__started = true;
const $ = id => document.getElementById(id);
const stage = $('stage');
try { main(); } catch (err) { console.error(err); stage.innerHTML = '<div class="fail">This browser could not start the 3D view.</div>'; $('veil').classList.add('out'); }

function main() {
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = x => { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); };
const sstep = (a, b, x) => smooth((x - a) / (b - a));
const D2R = Math.PI / 180;
const MOBILE = window.matchMedia('(max-width:900px)').matches || /Android|iPhone|iPad/i.test(navigator.userAgent);
const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const rng2 = (a, b) => a < b ? [a, b] : [b, a];
function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
const rand = mulberry(1926);
const wait = ms => new Promise(r => setTimeout(r, ms));

