/* ASPECT — export proof generators. Pure functions, zero dependencies.
   Input: an optimized SVG markup string. Output: framework-ready code. */

const ATTR_OVERRIDES = {
  'class': 'className',
  'for': 'htmlFor',
  'xlink:href': 'xlinkHref',
  'xlink:title': 'xlinkTitle',
  'xmlns:xlink': 'xmlnsXlink',
  'xml:space': 'xmlSpace',
};

function toCamel(name) {
  if (ATTR_OVERRIDES[name]) return ATTR_OVERRIDES[name];
  if (name.startsWith('data-') || name.startsWith('aria-')) return name;
  if (name.includes(':')) return name.replace(/:(.)/g, (_, c) => c.toUpperCase());
  if (name.includes('-')) return name.replace(/-(.)/g, (_, c) => c.toUpperCase());
  return name;
}

function styleToJsx(value) {
  const obj = value.split(';').map(s => s.trim()).filter(Boolean).map(decl => {
    const i = decl.indexOf(':');
    if (i === -1) return null;
    let prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    prop = prop.startsWith('--') ? prop : prop.replace(/-(.)/g, (_, c) => c.toUpperCase());
    const key = /^[a-zA-Z][a-zA-Z0-9]*$/.test(prop) ? prop : `'${prop}'`;
    return `${key}: '${val.replace(/'/g, "\\'")}'`;
  }).filter(Boolean);
  return `{{ ${obj.join(', ')} }}`;
}

function parseSVG(markup) {
  const doc = new DOMParser().parseFromString(markup, 'image/svg+xml');
  const err = doc.querySelector('parsererror');
  if (err || !doc.documentElement || doc.documentElement.nodeName === 'parsererror') {
    throw new Error('Invalid SVG markup');
  }
  return doc.documentElement;
}

function serializeJSX(node, indent) {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent.trim();
    return t ? indent + t : '';
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return '';

  const tag = node.nodeName;
  const attrs = [];
  for (const a of Array.from(node.attributes)) {
    const name = toCamel(a.name);
    if (a.name === 'style') attrs.push(`style=${styleToJsx(a.value)}`);
    else attrs.push(`${name}="${a.value}"`);
  }
  const attrStr = attrs.length ? ' ' + attrs.join(' ') : '';
  const children = Array.from(node.childNodes)
    .map(c => serializeJSX(c, indent + '  '))
    .filter(Boolean);

  if (!children.length) return `${indent}<${tag}${attrStr} />`;
  return `${indent}<${tag}${attrStr}>\n${children.join('\n')}\n${indent}</${tag}>`;
}

export function toJSX(svg, name = 'Icon') {
  const root = parseSVG(svg);
  // spread props onto root for composability
  const body = serializeJSX(root, '    ').replace(/^(\s*<svg)([^>]*?)(\s*\/?>)/m, '$1$2 {...props}$3');
  return `export const ${name} = (props) => (\n${body}\n);\n`;
}

export function toVue(svg, name = 'Icon') {
  const root = parseSVG(svg);
  const indented = svg.trim().split('\n').map(l => '  ' + l).join('\n');
  return `<template>\n${indented}\n</template>\n\n<script setup>\n// ${name}.vue — drop-in SVG component\n<\/script>\n`;
}

export function toTailwind(svg) {
  const root = parseSVG(svg);
  // size with utilities + inherit color via currentColor (idiomatic Tailwind icon)
  const cls = root.getAttribute('class') || '';
  root.setAttribute('class', ('w-6 h-6 inline-block ' + cls).trim());
  for (const el of [root, ...root.querySelectorAll('*')]) {
    const f = el.getAttribute('fill');
    if (f && f !== 'none' && !f.startsWith('url(')) el.setAttribute('fill', 'currentColor');
    const s = el.getAttribute('stroke');
    if (s && s !== 'none' && !s.startsWith('url(')) el.setAttribute('stroke', 'currentColor');
  }
  const out = new XMLSerializer().serializeToString(root);
  return out.replace(/ xmlns="[^"]*"/, m => m); // keep xmlns for standalone use
}

export function toDataURI(svg) {
  const enc = svg
    .replace(/\s+/g, ' ')
    .replace(/> </g, '><')
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/\{/g, '%7B')
    .replace(/\}/g, '%7D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .trim();
  return `data:image/svg+xml,${enc}`;
}

export const EXT = { svg: 'svg', jsx: 'jsx', vue: 'vue', tailwind: 'svg', datauri: 'txt' };

export function generate(fmt, svg) {
  switch (fmt) {
    case 'jsx': return toJSX(svg);
    case 'vue': return toVue(svg);
    case 'tailwind': return toTailwind(svg);
    case 'datauri': return toDataURI(svg);
    case 'svg':
    default: return svg;
  }
}
