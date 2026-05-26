import Navbar from './components/Navbar';
import Hero from './components/Hero';

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_105406_16f4600d-7a92-4292-b96e-b19156c7830a.mp4';

export default function App() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      {/* Full-screen looping background video */}
      <video
        className="absolute inset-0 h-full w-full object-cover"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
      />

      {/* Subtle darkening so white/80 text stays readable over the video */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/70" />

      {/* Content sits above the video */}
      <div className="relative z-10 flex h-full flex-col">
        <Navbar />
        <Hero />
      </div>
    </main>
  );
}
