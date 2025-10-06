import React from 'react'
import { Link } from 'react-router-dom'

type Slide = { src: string; alt?: string; gameId: number }

const slides: Slide[] = [
  { src: '/home/hero/1.png', alt: 'Hero 1', gameId: 419 },
  { src: '/home/hero/2.png', alt: 'Hero 2', gameId: 3476 },
  { src: '/home/hero/3.png', alt: 'Hero 3', gameId: 3244 },
  { src: '/home/hero/4.png', alt: 'Hero 4', gameId: 3513 },
  { src: '/home/hero/5.png', alt: 'Hero 5', gameId: 1572 },
]

export default function HomeHero() {
  const [currentSlide, setCurrentSlide] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full h-[420px] md:h-[500px] lg:h-[631px] rounded-lg overflow-hidden">
      {/* Images */}
      {slides.map((img, idx) => (
        <Link
          key={idx}
          to={`/detail/${img.gameId}`}
          className={`absolute inset-0 block z-10 ${
            idx === currentSlide ? "pointer-events-auto" : "pointer-events-none"
          }`}
        >
          <img
            src={img.src}
            alt={img.alt}
            className={`w-full h-full object-cover transition-opacity duration-1000 ${
              idx === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        </Link>
      ))} 

      {/* Dots indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-30">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2 h-2 rounded-full transition-colors ${
              idx === currentSlide ? "bg-white/40" : "bg-white"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
