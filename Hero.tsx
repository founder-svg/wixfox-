import { ArrowRight } from 'lucide-react';
import ShinyText from './ShinyText';

export default function Hero() {
  return (
    <div className="flex flex-1 flex-col px-4 pb-10 sm:px-6 lg:px-8">
      {/* ===== Top section: two-column paragraphs ===== */}
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 pt-6 lg:grid-cols-2 lg:gap-12">
        <p className="max-w-md text-sm text-white/80 md:text-base">
          We deliver transformative programs that empower emerging product
          designers with cutting-edge expertise and vision to thrive globally.
        </p>
        <p className="text-sm text-white/80 md:text-base lg:text-right">
          8000+ Talented Designers Launched !
        </p>
      </div>

      {/* ===== Hero center ===== */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center text-center">
        <p className="mb-6 text-xs uppercase tracking-tight text-white/80 md:text-sm">
          Seats for Next Program Opening Soon
        </p>

        <h1 className="font-sans text-5xl font-medium leading-[0.85] tracking-tighter text-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
          <span className="block">Become</span>
          <span className="block">
            <ShinyText
              text="Product Leader."
              speed={3}
              baseColor="#64CEFB"
              shineColor="#ffffff"
              spread={100}
            />
          </span>
        </h1>

        <button
          type="button"
          className="group mt-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black px-6 py-3 text-sm text-white transition-colors duration-300 hover:bg-gray-900 md:px-8 md:py-4"
        >
          Apply for Next Enrollment
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
