/* ASPECT — application controller.
   100% client-side: SVGO runs in the browser, nothing is ever uploaded. */

import { optimize } from '/vendor/svgo.browser.js';
import { generate, EXT } from '/assets/exporters.js';

const $ = (s) => document.querySelector(s);
const enc = new TextEncoder();
const bytesOf = (str) => enc.encode(str).length;
const kb = (b) => (b / 1024).toFixed(b < 1024 * 10 ? 1 : 0);

const SVGO_CONFIG = {
  multipass: true,
  plugins: [
    { name: 'preset-default', params: { overrides: { removeViewBox: false, cleanupIds: { minify: true } } } },
    'removeDimensions',          // normalize to a viewBox-driven box
    'sortAttrs',
  ],
};

const state = { rawSVG: '', optimizedSVG: '', name: 'icon', before: 0, after: 0, fmt: 'svg' };

/* ----------------------------------------------------------------- TOAST */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ------------------------------------------------------------ OPTIMIZE */
function setMetrics(before, after) {
  const remaining = before ? after / before : 1;
  const pct = before ? Math.max(0, Math.round((1 - after / before) * 100)) : 0;
  $('#byteBefore').textContent = kb(before) + ' KB';
  const afterEl = $('#byteAfter');
  afterEl.innerHTML = kb(after) + '<span class="unit"> KB</span>';
  // kinetic stack: the optimized number scales down as compression deepens
  const scale = 0.45 + 0.55 * Math.min(1, Math.max(0, remaining));
  afterEl.style.transformOrigin = 'left bottom';
  afterEl.style.transform = `scale(${scale.toFixed(3)})`;
  $('#redPct').textContent = pct + '%';
}

function renderPreview(svg) {
  const p = $('#preview');
  p.innerHTML = '';
  try {
    const doc = new DOMParser().parseFromString(svg, 'image/svg+xml');
    if (doc.querySelector('parsererror')) throw new Error('parse');
    p.appendChild(doc.documentElement.cloneNode(true));
  } catch {
    p.innerHTML = '<span class="preview__empty">preview unavailable</span>';
  }
}

function runOptimize() {
  const input = $('#inputCode').value.trim();
  if (!input) { toast('Drop or paste an SVG first'); return; }
  let result;
  try {
    result = optimize(input, SVGO_CONFIG);
  } catch (e) {
    toast('Could not parse SVG');
    return;
  }
  state.rawSVG = input;
  state.optimizedSVG = result.data;
  state.before = bytesOf(input);
  state.after = bytesOf(result.data);
  setMetrics(state.before, state.after);
  renderPreview(result.data);
  refreshOutput();
  enableExports(true);
  pushHistory();
}

/* --------------------------------------------------------------- EXPORT */
function refreshOutput() {
  if (!state.optimizedSVG) return;
  let out;
  try { out = generate(state.fmt, state.optimizedSVG); }
  catch { out = state.optimizedSVG; }
  $('#outputCode').value = out;
}

function enableExports(on) {
  $('#copyBtn').disabled = !on;
  $('#downloadBtn').disabled = !on;
}

function selectTab(fmt) {
  state.fmt = fmt;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('is-active', t.dataset.fmt === fmt));
  refreshOutput();
}

/* --------------------------------------------------------------- INPUT */
function loadSVGText(text, name) {
  $('#inputCode').value = text.trim();
  if (name) state.name = name.replace(/\.svg$/i, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'icon';
  $('#runBtn').disabled = !text.trim();
  runOptimize();
}

function readFile(file) {
  if (!file) return;
  if (!/svg/i.test(file.type) && !/\.svg$/i.test(file.name)) { toast('SVG files only'); return; }
  const r = new FileReader();
  r.onload = () => loadSVGText(String(r.result), file.name);
  r.readAsText(file);
}

/* ------------------------------------------------------- HISTORY (slips) */
const HKEY = 'aspect.history';
function getHistory() { try { return JSON.parse(localStorage.getItem(HKEY) || '[]'); } catch { return []; } }
function saveHistory(h) { try { localStorage.setItem(HKEY, JSON.stringify(h)); } catch {} }

function pushHistory() {
  const h = getHistory();
  const entry = {
    id: Date.now(),
    name: state.name,
    before: state.before,
    after: state.after,
    pct: state.before ? Math.round((1 - state.after / state.before) * 100) : 0,
    svg: state.optimizedSVG.length < 60000 ? state.optimizedSVG : '',
  };
  h.unshift(entry);
  saveHistory(h.slice(0, 8));
  renderSlips();
}

function renderSlips() {
  const h = getHistory();
  const wrap = $('#slips');
  wrap.innerHTML = '';
  $('#clearSlips').hidden = h.length === 0;
  h.forEach(e => {
    const b = document.createElement('button');
    b.className = 'slip';
    b.innerHTML = `${e.name}.svg<span class="s-pct">−${e.pct}%</span>`;
    b.addEventListener('click', () => {
      if (!e.svg) { toast('Slip too large to restore'); return; }
      state.optimizedSVG = e.svg; state.name = e.name;
      state.before = e.before; state.after = e.after;
      $('#inputCode').value = e.svg;
      setMetrics(e.before, e.after);
      renderPreview(e.svg);
      refreshOutput();
      enableExports(true);
      toast('Slip restored');
    });
    wrap.appendChild(b);
  });
}

/* ------------------------------------------------ CURSOR — Anchor Node */
function initCursor() {
  if (matchMedia('(hover: none)').matches) return;
  const anchor = $('#anchor');
  const h1 = $('#h1'), h2 = $('#h2');
  let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my;
  const interactive = 'a, button, textarea, .slip, .dropzone, .logo, .tab';

  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    const el = e.target;
    const isInteractive = el.closest && el.closest(interactive);
    anchor.classList.toggle('is-active', !!isInteractive);
    const onDark = el.closest && el.closest('.code, .run, .tab.is-active, .loader');
    anchor.classList.toggle('on-dark', !!onDark);
    // bezier handles extend outward on interactive hover
    const ext = isInteractive ? 8 : 0;
    h1.style.transform = `translateX(${-ext}px)`;
    h2.style.transform = `translateX(${ext}px)`;
  });

  (function raf() {
    cx += (mx - cx) * 0.22; cy += (my - cy) * 0.22;
    anchor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(raf);
  })();
}

/* --------------------------------------------------- LOADER — Path Simplify */
function runLoader() {
  const loader = $('#loader');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dismiss = () => loader.classList.add('done');

  if (reduce) { dismiss(); return; }

  // noisy raw path
  let d = 'M40 168 ';
  for (let i = 1; i <= 10; i++) {
    const x = 40 + i * 16 + (Math.random() * 18 - 9);
    const y = 60 + Math.sin(i) * 40 + (Math.random() * 60 - 30);
    d += `L${x.toFixed(0)} ${y.toFixed(0)} `;
  }
  $('#loaderRaw').setAttribute('d', d);

  const clean = $('#loaderClean');
  requestAnimationFrame(() => { clean.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.2,.7,.2,1)'; clean.style.strokeDashoffset = '0'; });

  // tick KB down
  const kbEl = $('#loaderKB');
  const start = performance.now(), from = 48.0, to = 12.4, dur = 1200;
  (function tick(t) {
    const p = Math.min(1, (t - start) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    kbEl.textContent = (from + (to - from) * e).toFixed(1);
    if (p < 1) requestAnimationFrame(tick);
  })(start);

  setTimeout(dismiss, 1600);
}

/* ------------------------------------------------------------- WIRING */
function init() {
  runLoader();
  initCursor();
  renderSlips();

  const dz = $('#dropzone'), fi = $('#fileInput'), input = $('#inputCode');

  dz.addEventListener('click', () => fi.click());
  fi.addEventListener('change', () => readFile(fi.files[0]));

  ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, (e) => { e.preventDefault(); dz.classList.add('is-drag'); }));
  ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, (e) => { e.preventDefault(); if (ev === 'dragleave' && dz.contains(e.relatedTarget)) return; dz.classList.remove('is-drag'); }));
  dz.addEventListener('drop', (e) => { const f = e.dataTransfer.files[0]; if (f) readFile(f); });
  // allow dropping anywhere on the input panel
  const ip = $('#inputPanel');
  ['dragover'].forEach(ev => ip.addEventListener(ev, (e) => e.preventDefault()));
  ip.addEventListener('drop', (e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) readFile(f); });

  input.addEventListener('input', () => { $('#runBtn').disabled = !input.value.trim(); });

  $('#runBtn').addEventListener('click', runOptimize);

  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => selectTab(t.dataset.fmt)));

  $('#copyBtn').addEventListener('click', async () => {
    const out = $('#outputCode').value;
    if (!out) return;
    try { await navigator.clipboard.writeText(out); markCopied(); toast('Copied to clipboard'); }
    catch { $('#outputCode').select(); document.execCommand('copy'); toast('Copied'); }
  });

  $('#downloadBtn').addEventListener('click', () => {
    const out = $('#outputCode').value;
    if (!out) return;
    const ext = EXT[state.fmt] || 'txt';
    const blob = new Blob([out], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${state.name}.${state.fmt === 'svg' || state.fmt === 'tailwind' ? 'svg' : ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Downloaded');
  });

  $('#clearSlips').addEventListener('click', () => { saveHistory([]); renderSlips(); toast('History cleared'); });

  enableExports(false);
}

function markCopied() {
  const b = $('#copyBtn');
  b.classList.add('copied'); b.textContent = 'Copied';
  setTimeout(() => { b.classList.remove('copied'); b.textContent = 'Copy'; }, 1200);
}

if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init);
