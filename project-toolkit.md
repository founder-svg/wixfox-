# Project Toolkit — Reusable Assets

A saved reference of the reusable code and assets from the WixFox / DesignPro
work. Keep this file and re-upload it in any future chat to pick up where you
left off.

---

## 1. Video background URLs

| Used in            | URL |
|--------------------|-----|
| WixFox cinematic hero | `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260406_094145_4a271a6c-3869-4f1c-8aa7-aeb0cb227994.mp4` |
| DesignPro hero        | `https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4` |

> Note: these CloudFront links belong to an external account and may expire.
> For production, host the video yourself and swap the URL.

---

## 2. Background video snippet (plain HTML)

```html
<video class="bg-video" autoplay muted loop playsinline preload="auto">
  <source src="VIDEO_URL_HERE" type="video/mp4">
</video>
```

```css
.bg-video {
  position: absolute;       /* use fixed for whole-page background */
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}
```

Put page content in a container with `position: relative; z-index: 10;` so it
sits above the video.

---

## 3. Liquid-glass effect (CSS)

```css
.liquid-glass {
  position: relative;
  overflow: hidden;
  border: none;
  background: rgba(255, 255, 255, 0.01);
  background-blend-mode: luminosity;
  -webkit-backdrop-filter: blur(4px);
  backdrop-filter: blur(4px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1);
}
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.4px;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.45) 0%,
    rgba(255,255,255,0.15) 20%,
    rgba(255,255,255,0)    40%,
    rgba(255,255,255,0)    60%,
    rgba(255,255,255,0.15) 80%,
    rgba(255,255,255,0.45) 100%);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
          mask-composite: exclude;
  pointer-events: none;
}
```

---

## 4. Blur-fade-up entrance animation (CSS)

```css
@keyframes blurFadeUp {
  from { opacity: 0; filter: blur(20px); transform: translateY(40px); }
  to   { opacity: 1; filter: blur(0);    transform: translateY(0); }
}
.animate-blur-fade-up {
  opacity: 0;
  animation: blurFadeUp 1s ease-out forwards;
}
```

Stagger elements with inline `style="animation-delay: 300ms"` (etc.).

---

## 5. Bottom blur overlay (blur only, no dark gradient)

```css
.blur-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  -webkit-backdrop-filter: blur(24px);
  backdrop-filter: blur(24px);
  -webkit-mask-image: linear-gradient(to top, #000 0%, transparent 45%);
  mask-image: linear-gradient(to top, #000 0%, transparent 45%);
}
```

---

## 6. ShinyText component (React + Framer Motion)

A light-blue text fill with a white shine sweeping left-to-right on a loop.

```tsx
import { motion } from 'framer-motion';

interface ShinyTextProps {
  text: string;
  speed?: number;       // seconds per sweep
  baseColor?: string;   // e.g. '#64CEFB'
  shineColor?: string;  // e.g. '#ffffff'
  spread?: number;      // gradient angle, degrees
  className?: string;
}

export default function ShinyText({
  text, speed = 3, baseColor = '#64CEFB',
  shineColor = '#ffffff', spread = 100, className = '',
}: ShinyTextProps) {
  const gradient = `linear-gradient(${spread}deg, ${baseColor} 0%, ${baseColor} 35%, ${shineColor} 50%, ${baseColor} 65%, ${baseColor} 100%)`;
  return (
    <motion.span
      className={className}
      style={{
        display: 'inline-block',
        backgroundImage: gradient,
        backgroundSize: '200% 100%',
        backgroundRepeat: 'repeat',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      }}
      initial={{ backgroundPosition: '0% 50%' }}
      animate={{ backgroundPosition: '200% 50%' }}
      transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
    >
      {text}
    </motion.span>
  );
}
```

Pure-CSS equivalent (no Framer Motion needed):

```css
.shiny-text {
  background-image: linear-gradient(100deg,
    #64CEFB 0%, #64CEFB 35%, #fff 50%, #64CEFB 65%, #64CEFB 100%);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: shineSweep 3s linear infinite;
}
@keyframes shineSweep {
  to { background-position: 200% 50%; }
}
```

---

## 7. Tech stacks used

- **WixFox site** — plain HTML / CSS / JS, single self-contained `index.html`.
- **DesignPro hero** — React + TypeScript + Vite + Tailwind CSS + Framer Motion
  + Lucide React. Breakpoints: sm 640, md 768, lg 1024, xl 1280.

---

## 8. Lessons / gotchas

- External videos do **not** load inside the in-app file preview (sandboxed).
  Always download the file and open it in a real browser to test video.
- `muted` + `playsinline` are required for video autoplay in modern browsers.
- Host videos on infrastructure you control for production reliability.
- When removing an element that JS references (e.g. `#particles`), guard the
  JS so it doesn't throw and halt the rest of the script.
