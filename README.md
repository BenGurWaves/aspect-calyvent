# Aspect

Aspect is a 100% client-side SVG asset optimizer and code generator. Built with Swiss/International Typographic Style principles, it provides instant optimization without server processing or user accounts.

## Features

- **Local Optimization**: SVGO library vendored locally — no server calls, no privacy concerns
- **Split-Screen Playground**: Raw input on left, optimized preview with kinetic byte stack on right
- **Five Export Formats**: SVG, JSX, Vue SFC, Tailwind inline SVG, Data URI
- **File History**: Local browser state stores recent optimizations
- **Custom Cursor**: Anchor Node cursor with crosshair and handles
- **Path Simplification Loader**: Animated noisy SVG path with byte countdown
- **Swiss Design**: Signal Yellow, Deep Charcoal, Code Surface Noir, Stark White palette with Neue Haas Grotesk Display and SF Mono typography

## Tech Stack

- Vanilla JavaScript (ES6+)
- SVGO (vendored locally as `/vendor/svgo.browser.js`)
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
│   ├── app.js              # Main application controller
│   └── exporters.js        # Export format generators
├── vendor/
│   └── svgo.browser.js     # Vendored SVGO library
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
- Solid 2px charcoal rules
- Architectural typography with Neue Haas Grotesk Display and SF Mono
- Kinetic truncation logo with anchor points visible on hover
- Living texture through subtle animations and transitions

## Attribution

Aspect is a Calyvent tool. Attribution stamps link to:
- velocity.calyvent.com
- calyvent.com

## License

Proprietary. All rights reserved.
