'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation, Keyboard, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
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
      className="w-full max-w-7xl mx-auto rounded-xl overflow-hidden shadow-lg"
    >
      <Swiper
        modules={[Autoplay, Pagination, Navigation, Keyboard, A11y]}
        slidesPerView={1}
        loop
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={{
          nextEl: '.swiper-button-next-custom',
          prevEl: '.swiper-button-prev-custom',
        }}
        keyboard={{ enabled: true }}
        a11y={{
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
          slideLabelMessage: 'Slide {{index}} of {{slidesLength}}',
        }}
        className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px]"
      >
        {images.map((src, index) => (
          <SwiperSlide key={index} aria-label={`Slide ${index + 1} of ${images.length}`}>
            <div className="relative w-full h-full group">
              <Image
                src={src}
                alt={`Slide ${index + 1}`}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority={index === 0}
                loading={index === 0 ? 'eager' : 'lazy'}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1600px"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

              {/* Caption */}
              <div className="absolute bottom-6 left-6 z-10 max-w-lg text-white">
                <span className="text-xs uppercase tracking-wide bg-white/20 px-2 py-1 rounded-full">
                  Featured
                </span>
                <h3 className="mt-2 text-lg md:text-2xl font-semibold drop-shadow-md">
                  Hand-picked items for you
                </h3>
                <div className="mt-3 flex gap-3 items-center">
                  <Link
                    href="/buyer/dashboard"
                    className="px-4 py-2 bg-white/90 text-slate-900 rounded-md text-sm font-medium shadow hover:scale-[1.03] transition"
                  >
                    Explore
                  </Link>
                  <span className="px-3 py-1 bg-white/20 text-white/90 text-sm rounded-md">
                    {index + 1}/{images.length}
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}

        {/* Custom Navigation Arrows */}
        <div className="swiper-button-prev-custom absolute top-1/2 -left-4 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/70 hover:bg-white/90 text-slate-900 rounded-full flex items-center justify-center cursor-pointer z-20 shadow">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </div>
        <div className="swiper-button-next-custom absolute top-1/2 -right-4 transform -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 bg-white/70 hover:bg-white/90 text-slate-900 rounded-full flex items-center justify-center cursor-pointer z-20 shadow">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </Swiper>

      {/* Visually hidden instructions */}
      <div className="sr-only" aria-hidden={false}>
        Use left and right arrow keys to navigate slides. Autoplay pauses on hover.
      </div>
    </section>
  );
}
