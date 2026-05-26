import { useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';

const NAV_LINKS = [
  'Home',
  'About Us',
  'Courses',
  'Instructors',
  'Testimonials',
  'Blog',
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="relative z-20 w-full">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        {/* Logo */}
        <a href="#" className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white">
            <span className="h-2.5 w-2.5 rounded-full bg-white" />
          </span>
          <span className="text-base font-semibold tracking-tight text-white">
            DesignPro
          </span>
        </a>

        {/* Desktop nav pill */}
        <nav className="hidden items-center gap-1 rounded-full border border-gray-700 bg-black/30 px-2 py-1.5 backdrop-blur-sm lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link}
              href="#"
              className="rounded-full px-3 py-1.5 text-sm text-white/80 transition-colors hover:text-white"
            >
              {link}
            </a>
          ))}
          <a
            href="#"
            className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-white/80 transition-colors hover:text-white"
          >
            Contact us
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-700 text-white transition-colors hover:bg-white/10 lg:hidden"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="mx-4 rounded-2xl border border-gray-700 bg-black/90 p-3 backdrop-blur-md sm:mx-6 lg:hidden">
          <nav className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
              >
                {link}
              </a>
            ))}
            <a
              href="#"
              onClick={() => setOpen(false)}
              className="flex items-center gap-1 rounded-lg px-3 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/5 hover:text-white"
            >
              Contact us
              <ArrowUpRight className="h-3.5 w-3.5" />
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
