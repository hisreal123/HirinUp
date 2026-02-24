'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';

import 'swiper/css';

const logos = [
  'https://talvin.ai/wp-content/uploads/2025/08/icons-1-e1755670976517.webp',
  'https://talvin.ai/wp-content/uploads/2025/08/icons-2-e1755670805576.webp',
  'https://talvin.ai/wp-content/uploads/2025/08/icons-3-e1755670773104.webp',
  'https://talvin.ai/wp-content/uploads/2025/08/icons-4-e1755670714274.webp',
  'https://talvin.ai/wp-content/uploads/2025/08/icons-5-e1755670681240.webp',
  'https://talvin.ai/wp-content/uploads/2025/08/icons-6-e1755670628682.webp',
];

export default function IntegrationsCarousel() {
  return (
    <div className="relative items-center bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.25),rgba(255,255,255,0.05))] shadow-[0_0_10px_0_rgba(0,0,0,0.06)] rounded-2xl bg-[#141414ED] py-24 overflow-hidden">
      {/* TOP ROW */}
      <Swiper
        modules={[Autoplay]}
        slidesPerView={4.5}
        spaceBetween={16}
        speed={2000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        className="mb-4"
        loop
      >
        {[...logos, ...logos].map((logo, i) => (
          <SwiperSlide key={`top-${i}`}>
            <LogoBox src={logo} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* BOTTOM ROW (opposite direction) */}
      <Swiper
        modules={[Autoplay]}
        slidesPerView={4.5}
        spaceBetween={16}
        speed={2000}
        autoplay={{
          delay: 0,
          reverseDirection: true,
          disableOnInteraction: false,
        }}
        loop
      >
        {[...logos, ...logos].map((logo, i) => (
          <SwiperSlide key={`bottom-${i}`}>
            <LogoBox src={logo} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

function LogoBox({ src }: { src: string }) {
  return (
    <div className="flex items-center justify-center w-[114px] h-[114px] rounded-xl bg-[#3a3a3a] border border-white/10">
      <img src={src} alt="logo" className=" object-contain opacity-90" />
    </div>
  );
}
