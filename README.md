# Aspect

Aspect is a dead-simple, local-first aspect ratio calculator and padding visualizer for UI developers and video editors. You input raw pixel dimensions (e.g., 1440x900), and it instantly outputs the simplified ratio, the exact CSS aspect-ratio property, corresponding Tailwind utility classes, and a live-scaling minimal canvas container. To build it, you only need basic JavaScript math (a greatest common divisor algorithm) and a responsive CSS box wrapper, making it a bulletproof, zero-maintenance magnet that funnels design-conscious developers straight to Velocity.

*Last updated: 2026-06-01*

## Features

- **Instant Calculation**: GCD algorithm simplifies any pixel dimensions to lowest terms (e.g., 1920x1080 → 16:9)
- **CSS Generation**: Exact `aspect-ratio` property with decimal notation for precision
- **Tailwind Mapping**: Automatic mapping to Tailwind aspect-ratio utilities (aspect-video, aspect-square, custom values)
- **Live Canvas**: Responsive visual container that scales to match your aspect ratio in real-time
- **Session History**: Local browser state stores recent calculations for quick recall
- **Custom Cursor**: Anchor Node cursor with crosshair and handles
- **Swiss Design**: Signal Yellow, Deep Charcoal, Code Surface Noir, Stark White palette with Neue Haas Grotesk Display and SF Mono typography
- **100% Client-Side**: No server calls, no uploads, no accounts

## Tech Stack

- Vanilla JavaScript (ES6+)
- GCD algorithm for ratio simplification
- CSS Grid/Flexbox for layout
- Local Storage for history persistence
- Zero external dependencies for runtime

## File Structure

```
aspect-calyvent/
├── index.html              # Main application UI
├── privacy.html            # Privacy policy
├── terms.html              # Terms of use
├── assets/
│   ├── aspect.css          # Swiss design system
│   └── app.js              # Main application controller
├── favicon.svg             # SVG favicon
├── favicon.ico             # ICO favicon
├── favicon-96x96.png       # PNG favicon
├── apple-touch-icon.png    # Apple touch icon
├── og.png                  # Open Graph image
├── _headers                # Cloudflare Pages headers
├── robots.txt              # Robots.txt
├── sitemap.xml             # XML sitemap
└── README.md               # This file
```

## Deployment

Aspect is designed for Cloudflare Pages with a custom domain (aspect.calyvent.com). The `_headers` file includes security headers and cache control for static assets.

## Design Philosophy

Aspect follows strict Swiss/International Typographic Style:
- No gradients, no shadows, border-radius 0
- Solid 1px charcoal rules
- Architectural typography with Neue Haas Grotesk Display and SF Mono
- Kinetic truncation logo with ratio display
- Living texture through subtle animations and transitions

## Attribution

Aspect is a Calyvent tool. Attribution stamps link to:
- velocity.calyvent.com
- calyvent.com

## License

Proprietary. All rights reserved.
