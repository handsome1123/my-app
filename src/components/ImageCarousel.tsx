'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './ImageCarousel.css';
import Image from 'next/image';
import Link from 'next/link';

interface ImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  if (!images || images.length === 0) return null;

  return (
    <section
      aria-label="Homepage featured banners"
      role="region"
      className="w-full max-w-7xl mx-auto rounded-xl overflow-hidden"
    >
      <Swiper
        modules={[Autoplay, Pagination, Navigation, Keyboard, A11y]}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={true}
        keyboard={{ enabled: true }}
        a11y={{
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
          slideLabelMessage: 'Slide {{index}} of {{slidesLength}}',
        }}
        className="h-[300px] md:h-[360px] lg:h-[420px] relative"
      >
        {images.map((src, index) => (
          <SwiperSlide key={index} aria-label={`Slide ${index + 1} of ${images.length}`}>
            <div className="relative w-full h-full bg-gray-100">
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                className="w-full h-full object-cover"
                fill
                sizes="(max-width: 640px) 640px, (max-width: 1024px) 1024px, 1600px"
                priority={index === 0}
                // Next/Image loading prop is 'eager' when priority, otherwise lazy
                loading={index === 0 ? 'eager' : 'lazy'}
              />

              {/* Gradient overlay + caption */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-0 bottom-0 w-full h-36 bg-gradient-to-t from-black/50 to-transparent" />
              </div>

              <div className="absolute left-6 bottom-6 z-10 text-white pointer-events-auto max-w-xl">
                <div className="mb-2 text-xs uppercase tracking-wide bg-white/10 inline-block px-2 py-1 rounded-full">
                  Featured
                </div>
                <div className="text-lg md:text-2xl font-semibold drop-shadow-md">
                  {/* Minimal generic caption: keep content generic to avoid changing API */}
                  Hand-picked items for you
                </div>
                <div className="mt-3 flex gap-3">
                  <Link href="/buyer/dashboard" className="inline-flex items-center px-4 py-2 bg-white/90 text-slate-900 rounded-md text-sm font-medium shadow hover:scale-[1.02] transition">
                    Explore
                  </Link>
                  <button
                    aria-hidden
                    className="inline-flex items-center px-3 py-2 bg-transparent border border-white/30 text-sm rounded-md text-white/90 hover:bg-white/10 transition"
                    onClick={(e) => { e.stopPropagation(); /* decorative */ }}
                  >
                    {index + 1}/{images.length}
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Visually hidden instructions for keyboard users */}
      <div className="sr-only" aria-hidden={false}>
        Use left and right arrow keys to navigate slides. Autoplay pauses on hover.
      </div>
    </section>
  );
}
