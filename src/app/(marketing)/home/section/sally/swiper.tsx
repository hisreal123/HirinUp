'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useRef, useState } from 'react';

const steps = [
  {
    step: '01',
    title: 'Set Up Your Hiring Criteria',
    desc: 'Create and customize your hiring requirements for smarter candidate selection.',
    img: 'step-images/step-1.webp',
  },
  {
    step: '02',
    title: 'AI Voice Interviews',
    desc: 'Talvin conducts AI-powered voice interviews for efficient candidate screening.',
    img: 'step-images/step-2.webp',
  },
  {
    step: '03',
    title: 'Candidate Insights Analysis',
    desc: 'Provides accurate, actionable insights to make faster hiring decisions.',
    img: 'step-images/step-3.webp',
  },
  {
    step: '04',
    title: 'Candidate Insights Analysis',
    desc: 'Provides accurate, actionable insights to make faster hiring decisions.',
    img: 'step-images/step-4.webp',
  },
];

const STEPPER_IMAGES = [
  'https://talvin.ai/wp-content/uploads/2025/04/Frame-2147225944-1024x77.webp',
  'https://talvin.ai/wp-content/uploads/2025/04/Frame-2147225943-1024x77.webp',
  'https://talvin.ai/wp-content/uploads/2025/04/Frame-2147225943-1024x77.webp',
  'https://talvin.ai/wp-content/uploads/2025/04/Frame-2147225943-1024x77.webp',
];

export default function SliderReviw() {
  const cardSwiperRef = useRef<any>(null);
  const stepperSwiperRef = useRef<any>(null);

  const [active, setActive] = useState(0);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const handleSlideChange = (swiper: any) => {
    setActive(swiper.activeIndex);
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);

    stepperSwiperRef.current?.slideTo(swiper.activeIndex);
  };

  return (
    <section className="w-full bg-[#F8F8F8] pt-24">
      {/* ───────── STEPPER ───────── */}
      <div className="px-[1%] mb-14">
        <Swiper
          modules={[Navigation]}
          slidesPerView={3}
          allowTouchMove={false}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1280: { slidesPerView: 3 },
          }}
          onSwiper={(s) => (stepperSwiperRef.current = s)}
        >
          {STEPPER_IMAGES.map((img, i) => (
            <SwiperSlide key={i}>
              <img src={img} className="w-full object-contain" />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ───────── CARD SWIPER ───────── */}
      <div className="px-[2%]">
        <Swiper
          modules={[Navigation]}
          slidesPerView={3}
          spaceBetween={40}
          breakpoints={{
            0: { slidesPerView: 1 },
            768: { slidesPerView: 2 },
            1280: { slidesPerView: 3 },
          }}
          onSwiper={(s) => {
            cardSwiperRef.current = s;
            setIsBeginning(s.isBeginning);
            setIsEnd(s.isEnd);
          }}
          onSlideChange={handleSlideChange}
        >
          {steps.map((step, i) => (
            <SwiperSlide key={i}>
              <div className="h-[350px]">
                <div className="h-[250px] p-6 bg-[#F6F1FF] rounded-2xl flex items-center justify-center">
                  <img src={step.img} className="h-[200px] object-contain" />
                </div>

                <h3 className="text-xl text-black font-bold mt-4 tracking-[-1px]">
                  {step.step}. {step.title}
                </h3>
                <p className="text-base text-gray-500 mt-2 tracking-[-1px]">
                  {step.desc}
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* ───────── NAVIGATION ───────── */}
      <div className="flex justify-end gap-3 mt-12 px-[4%]">
        <button
          className={`prev-btn w-10 h-10 rounded-full border text-black flex items-center justify-center
            ${isBeginning ? '' : 'border-purple-600 text-white bg-purple-600'}
          `}
          onClick={() => cardSwiperRef.current?.slidePrev()}
        >
          ‹
        </button>

        <button
          className={`next-btn w-10 h-10 rounded-full flex items-center justify-center
            ${isEnd ? 'bg-gray-300 text-white' : 'bg-purple-600 text-white'}
          `}
          onClick={() => cardSwiperRef.current?.slideNext()}
        >
          ›
        </button>
      </div>
    </section>
  );
}
