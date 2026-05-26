# DesignPro — Hero Section

A full-screen cinematic hero section for the product-design education platform
**DesignPro**, built with React, TypeScript, Vite, Tailwind CSS, Framer Motion,
and Lucide React.

## Getting started

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

## Build for production

```bash
npm run build
npm run preview
```

## Project structure

```
designpro-hero/
├── index.html              # Loads Inter from Google Fonts
├── src/
│   ├── main.tsx            # React entry point
│   ├── App.tsx             # Full-screen video background + layout
│   ├── index.css           # Tailwind directives + base styles
│   └── components/
│       ├── Navbar.tsx      # Logo, pill nav links, mobile menu
│       ├── Hero.tsx        # Top paragraphs, heading, CTA
│       └── ShinyText.tsx   # Framer Motion shiny gradient text
├── tailwind.config.js
└── vite.config.ts
```

## The ShinyText component

`ShinyText` fills text with a CSS gradient (`background-clip: text` +
transparent text fill) and uses Framer Motion to animate `backgroundPosition`,
sweeping a white shine across the light-blue text left-to-right on a 3s loop.

Props: `text`, `speed` (seconds), `baseColor`, `shineColor`, `spread` (degrees),
`className`.

## Notes

- A subtle dark gradient overlay sits between the video and the content so the
  white/80 body text stays legible. Remove the overlay `<div>` in `App.tsx` if
  you want the raw video.
- The background video is loaded from an external CloudFront URL. For a
  production deployment, host the video on infrastructure you control.
