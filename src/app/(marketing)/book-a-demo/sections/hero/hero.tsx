'use client';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import BookingCalendar from './booking-calender';
import CallTOActionLayout from '@/app/(marketing)/layout/cta';

export default function HeroSection() {
  const formRef = useRef<HTMLDivElement>(null);
  const [formTop, setFormTop] = useState(0);

  const { scrollY } = useScroll();
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  // Track form top position relative to page
  useEffect(() => {
    if (formRef.current) {
      const rect = formRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || window.pageYOffset;
      setFormTop(rect.top + scrollTop);
    }
  }, []);

  // Map scrollY relative to form position to small vertical motion
  // Moves ±30px as page scrolls
  const yMotion = useTransform(
    scrollY,
    [formTop - 500, formTop + 500],
    [30, -30]
  );

  return (
    <>
      <section className="relative  mt-[-97px]">
        {/* HERO BACKGROUND */}
        <div className="absolute hero-bg inset-0 bg-cover bg-center bg-no-repeat" />
        <div className="absolute hero-overlay inset-0 bg-black/30 bg-cover bg-center bg-no-repeat" />
        {/* HERO CONTENT */}
        <div className="relative z-10 flex flex-col items-center justify-center pt-32 pb-10 px-6 text-center">
          {/* Badge */}
          <span className="inline-block rounded-full mt-3 md:mt-16 bg-[#171064] border border-[#C3C3C363] px-4 py-2 text-xs md:text-sm mb-6">
            Book Demo
          </span>

          {/* Heading */}
          <h1 className="text-[31px] md:text-[50px] font-normal leading-tight tracking-tight max-w-5xl">
            See Talvin in Action
          </h1>

          {/* Description */}
          <p className="mt-6 text-gray-300 text-[16px] max-w-4xl">
            Get a firsthand look at how Talvin streamlines hiring with AI-driven
            interviews and insights. Schedule a demo today and discover a
            faster, smarter way to recruit top talent.
          </p>

          {/* DEMO FORM */}
          <div className="mt-10 w-full max-w-6xl">
            <BookingCalendar />
          </div>
        </div>
      </section>

      <section className="w-full bg-white pb-20">
        {/* ================= CTA ================= */}
        <CallTOActionLayout />
      </section>
    </>
  );
}
