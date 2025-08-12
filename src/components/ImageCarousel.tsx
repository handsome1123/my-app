'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import './ImageCarousel.css';
import Image from 'next/image';

interface ImageCarouselProps {
  images: string[];
}

export default function ImageCarousel({ images }: ImageCarouselProps) {
  return (
    <div className="w-full max-w-7xl mx-auto rounded-xl overflow-hidden ">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        slidesPerView={1}
        loop={true}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        // navigation={true}
        className="h-[300px] md:h-[300px] lg:h-[300px]"
      >
        {images.map((src, index) => (
          <SwiperSlide key={index}>
            <Image
              src={src}
              alt={`Slide ${index + 1}`}
              className="w-full h-full object-cover"
              fill
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
