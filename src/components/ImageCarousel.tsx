'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface CarouselImage {
  src: string
  alt: string
}

interface ImageCarouselProps {
  images: CarouselImage[]
  interval?: number // in milliseconds
}

const ImageCarousel: React.FC<ImageCarouselProps> = ({ images, interval = 3000 }) => {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length)
    }, interval)
    return () => clearInterval(timer)
  }, [images.length, interval])

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + images.length) % images.length)
  }

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % images.length)
  }

  return (
    <div className="relative w-full h-85 overflow-hidden rounded-lg">
      {images.map((img, idx) => (
        <div
          key={idx}
          className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ${
            idx === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            className="object-cover"
            priority={idx === 0}
            sizes="100vw"
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-20"></div>

      {/* Text Content */}
      <div className="absolute bottom-8 left-8 z-30 text-white max-w-md">
        <h2 className="text-4xl font-bold mb-4">Up to 10% off Voucher</h2>
        <a href="#" className="inline-flex items-center text-lg hover:underline">
          Shop Now
          <ChevronRight className="w-5 h-5 ml-2" />
        </a>
      </div>

      {/* Arrows */}
      <button onClick={prevSlide} className="absolute top-1/2 left-4 z-40 -translate-y-1/2 text-white">
        <ChevronLeft className="w-8 h-8" />
      </button>
      <button onClick={nextSlide} className="absolute top-1/2 right-4 z-40 -translate-y-1/2 text-white">
        <ChevronRight className="w-8 h-8" />
      </button>
    </div>
  )
}

export default ImageCarousel
