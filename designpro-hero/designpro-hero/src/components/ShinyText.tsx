import { motion } from 'framer-motion';

interface ShinyTextProps {
  /** The text to render with the shiny gradient. */
  text: string;
  /** Duration of one full left-to-right sweep, in seconds. Default: 3. */
  speed?: number;
  /** Base text color. Default: #64CEFB (light blue). */
  baseColor?: string;
  /** Shine highlight color. Default: #ffffff (white). */
  shineColor?: string;
  /** Gradient angle / spread in degrees. Default: 100. */
  spread?: number;
  /** Extra Tailwind / CSS classes (for sizing, weight, etc.). */
  className?: string;
}

/**
 * ShinyText
 * ---------
 * Renders text whose fill is a CSS gradient (base color -> shine -> base color).
 * Framer Motion continuously animates `backgroundPosition` so the white shine
 * sweeps across the text from left to right, looping seamlessly.
 *
 * The gradient is clipped to the glyphs via `background-clip: text` with a
 * transparent text fill, so the animated gradient *becomes* the letters.
 */
export default function ShinyText({
  text,
  speed = 3,
  baseColor = '#64CEFB',
  shineColor = '#ffffff',
  spread = 100,
  className = '',
}: ShinyTextProps) {
  // Base colour on the outer stops, a bright shine band through the middle.
  const gradient = `linear-gradient(${spread}deg, ${baseColor} 0%, ${baseColor} 35%, ${shineColor} 50%, ${baseColor} 65%, ${baseColor} 100%)`;

  return (
    <motion.span
      className={className}
      style={{
        display: 'inline-block',
        backgroundImage: gradient,
        // The gradient tile is twice the text width; a 200% travel = one
        // seamless period because the background repeats by default.
        backgroundSize: '200% 100%',
        backgroundRepeat: 'repeat',
        WebkitBackgroundClip: 'text',
        backgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        color: 'transparent',
      }}
      initial={{ backgroundPosition: '0% 50%' }}
      animate={{ backgroundPosition: '200% 50%' }}
      transition={{
        duration: speed,
        ease: 'linear',
        repeat: Infinity,
      }}
    >
      {text}
    </motion.span>
  );
}
