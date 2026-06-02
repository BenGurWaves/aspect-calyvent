/* ASPECT — aspect ratio calculator.
   100% client-side: GCD algorithm, CSS generation, Tailwind mapping. */

const $ = (s) => document.querySelector(s);

// GCD algorithm for ratio simplification
function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a;
}

// Simplify ratio to lowest terms
function simplifyRatio(w, h) {
  const d = gcd(w, h);
  return { w: w / d, h: h / d };
}

// Tailwind aspect-ratio utility mapping
const TAILWIND_RATIOS = {
  '1:1': 'aspect-square',
  '16:9': 'aspect-video',
  '4:3': 'aspect-[4/3]',
  '3:2': 'aspect-[3/2]',
  '21:9': 'aspect-[21/9]',
  '2:1': 'aspect-[2/1]',
  '3:4': 'aspect-[3/4]',
  '9:16': 'aspect-[9/16]',
};

const state = { width: 1920, height: 1080, ratio: '16:9', decimal: 1.78, fmt: 'css' };

/* ----------------------------------------------------------------- TOAST */
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 1800);
}

/* ----------------------------------------------------------- CALCULATE */
function calculate() {
  const w = parseInt($('#widthInput').value) || 0;
  const h = parseInt($('#heightInput').value) || 0;
  
  if (w <= 0 || h <= 0) {
    toast('Enter valid dimensions');
    return;
  }
  
  if (w > 9999999 || h > 9999999) {
    toast('Dimensions too large');
    return;
  }

  state.width = w;
  state.height = h;
  
  const { w: sw, h: sh } = simplifyRatio(w, h);
  state.ratio = `${sw}:${sh}`;
  state.decimal = (w / h).toFixed(2);
  
  updateDisplay();
  updateCanvas();
  updateOutput();
  pushHistory();
}

function updateDisplay() {
  $('#ratioMain').textContent = state.ratio;
  $('#ratioDecimal').textContent = state.decimal;
  $('#canvasLabel').textContent = state.ratio;
  $('.logo__vb').textContent = state.ratio;
}

function updateCanvas() {
  const box = $('#canvasBox');
  const wrapper = $('#canvasWrapper');
  const wrapperRect = wrapper.getBoundingClientRect();
  const padding = 48;
  const maxW = wrapperRect.width - padding;
  const maxH = wrapperRect.height - padding;
  
  // Calculate scale to fit within wrapper while preserving aspect ratio
  const scale = Math.min(maxW / state.width, maxH / state.height);
  const displayW = state.width * scale;
  const displayH = state.height * scale;
  
  box.style.width = `${displayW}px`;
  box.style.height = `${displayH}px`;
}

function updateOutput() {
  let out = '';
  if (state.fmt === 'css') {
    out = `aspect-ratio: ${state.ratio.replace(':', '/')} /* ${state.decimal} */`;
  } else if (state.fmt === 'tailwind') {
    const utility = TAILWIND_RATIOS[state.ratio] || `aspect-[${state.ratio.replace(':', '/')}]`;
    out = `${utility} /* ${state.ratio} */`;
  }
  $('#outputCode').value = out;
}

function selectTab(fmt) {
  state.fmt = fmt;
  document.querySelectorAll('.tab').forEach(t => t.classList.toggle('is-active', t.dataset.fmt === fmt));
  updateOutput();
}

/* ------------------------------------------------------- HISTORY (slips) */
const HKEY = 'aspect.history';
function getHistory() { try { return JSON.parse(localStorage.getItem(HKEY) || '[]'); } catch { return []; } }
function saveHistory(h) { try { localStorage.setItem(HKEY, JSON.stringify(h)); } catch {} }

function pushHistory() {
  const h = getHistory();
  const entry = {
    id: Date.now(),
    w: state.width,
    h: state.height,
    ratio: state.ratio,
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
    const label = document.createElement('span');
    label.textContent = `${e.w}×${e.h}`;
    const ratio = document.createElement('span');
    ratio.className = 's-pct';
    ratio.textContent = e.ratio;
    b.appendChild(label);
    b.appendChild(ratio);
    b.addEventListener('click', () => {
      $('#widthInput').value = e.w;
      $('#heightInput').value = e.h;
      state.width = e.w;
      state.height = e.h;
      state.ratio = e.ratio;
      state.decimal = (e.w / e.h).toFixed(2);
      updateDisplay();
      updateCanvas();
      updateOutput();
      toast('Restored');
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
  const interactive = 'a, button, input, .slip, .logo, .tab';

  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    const el = e.target;
    const isInteractive = el.closest && el.closest(interactive);
    anchor.classList.toggle('is-active', !!isInteractive);
    const onDark = el.closest && el.closest('.code, .run, .tab.is-active, .loader, .canvas-box');
    anchor.classList.toggle('on-dark', !!onDark);
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

/* --------------------------------------------------- LOADER — Ratio Calc */
function runLoader() {
  const loader = $('#loader');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dismiss = () => loader.classList.add('done');

  if (reduce) { dismiss(); return; }

  let d = 'M40 168 ';
  for (let i = 1; i <= 10; i++) {
    const x = 40 + i * 16 + (Math.random() * 18 - 9);
    const y = 60 + Math.sin(i) * 40 + (Math.random() * 60 - 30);
    d += `L${x.toFixed(0)} ${y.toFixed(0)} `;
  }
  $('#loaderRaw').setAttribute('d', d);

  const clean = $('#loaderClean');
  requestAnimationFrame(() => { clean.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(.2,.7,.2,1)'; clean.style.strokeDashoffset = '0'; });

  const kbEl = $('#loaderKB');
  const ratios = ['16:9', '4:3', '1:1', '3:2', '21:9'];
  let idx = 0;
  const start = performance.now(), dur = 1200;
  (function tick(t) {
    const p = Math.min(1, (t - start) / dur);
    const e = 1 - Math.pow(1 - p, 3);
    const rIdx = Math.floor(e * (ratios.length - 1));
    kbEl.textContent = ratios[rIdx];
    if (p < 1) requestAnimationFrame(tick);
  })(start);

  setTimeout(dismiss, 1600);
}

/* ------------------------------------------------------------- WIRING */
function init() {
  runLoader();
  initCursor();
  renderSlips();

  $('#widthInput').value = state.width;
  $('#heightInput').value = state.height;
  updateDisplay();
  updateCanvas();
  updateOutput();

  $('#calcBtn').addEventListener('click', calculate);
  
  // Auto-calculate on input
  $('#widthInput').addEventListener('input', () => { if ($('#heightInput').value) calculate(); });
  $('#heightInput').addEventListener('input', () => { if ($('#widthInput').value) calculate(); });

  document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => selectTab(t.dataset.fmt)));

  $('#copyBtn').addEventListener('click', async () => {
    const out = $('#outputCode').value;
    if (!out) return;
    try { await navigator.clipboard.writeText(out); markCopied(); toast('Copied to clipboard'); }
    catch { $('#outputCode').select(); document.execCommand('copy'); toast('Copied'); }
  });

  $('#clearSlips').addEventListener('click', () => { saveHistory([]); renderSlips(); toast('History cleared'); });

  // Resize canvas on window resize
  window.addEventListener('resize', updateCanvas);
}

function markCopied() {
  const b = $('#copyBtn');
  b.classList.add('copied'); b.textContent = 'Copied';
  setTimeout(() => { b.classList.remove('copied'); b.textContent = 'Copy'; }, 1200);
}

if (document.readyState !== 'loading') init();
else document.addEventListener('DOMContentLoaded', init());
