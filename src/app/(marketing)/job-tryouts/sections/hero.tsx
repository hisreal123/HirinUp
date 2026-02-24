'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';

export default function HeroSection() {
  const formRef = useRef<HTMLDivElement>(null);
  const [formTop, setFormTop] = useState(0);

  const { scrollY } = useScroll();

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
    <section className="relative min-h-screen mt-[-97px]">
      {/* HERO BACKGROUND */}
      <div className="absolute hero-bg inset-0 bg-cover bg-center bg-no-repeat" />

      {/* HERO CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-32 pb-10 px-6 text-center">
        {/* Badge */}
        <span className="inline-block rounded-full mt-3 md:mt-16 bg-[#171064] border border-[#C3C3C363] px-4 py-2 text-xs md:text-sm mb-6">
          Real Roles. Real Scenarios. Real Talent.
        </span>

        {/* Heading */}
        <h1 className="text-[31px] md:text-[50px] font-normal leading-tight tracking-tight max-w-5xl">
          Let Candidates Experience the Role <br /> Before You Hire
        </h1>

        {/* Description */}
        <p className="mt-6 text-gray-300 text-[16px] max-w-4xl">
          Talvin’s Job Tryouts simulate real customer interactions and
          automatically evaluate how candidates respond — giving you clear,
          contextual insights into their people skills before you make the next
          move.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/book-a-demo"
            className="rounded-full flex items-center  h-[44px] text-[14px] border border-white/30 bg-white text-black px-4 py-1 font-normal hover:bg-black hover:text-white"
          >
            <span>See Job Tryouts in Action</span>
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full flex items-center h-[44px] text-[14px] border border-white/30 px-4 py-1 hover:bg-white hover:text-black"
          >
            Create an Account
          </Link>
        </div>

        {/* DEMO FORM */}
        <motion.div
          ref={formRef}
          style={{ y: yMotion }}
          className="mt-5 w-full md:max-w-6xl mx-auto overflow-hidden "
        >
          <div className="mt-5 w-full  aspect-video rounded-2xl backdrop-blur-[5px] shadow-2xl overflow-hidden ">
            <iframe
              width="640"
              height="360"
              src="https://www.youtube.com/embed/jYUDHHFhTWE"
              title="Revolutionary AI Job Simulation: Test Candidates Before You Hire | Talvin Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              className="w-full h-full flex"
              allowFullScreen
             />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
