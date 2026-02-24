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
    <section className="relative min-h-screen mt-[-92px]">
      {/* HERO BACKGROUND */}
      <div className="absolute hero-bg inset-0 bg-cover bg-center bg-no-repeat" />

      {/* HERO CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-32 pb-10 px-6 text-center">
        {/* Badge */}
        <span className="inline-block rounded-full mt-3 md:mt-16 bg-[#171064] border border-[#C3C3C363] px-4 py-2 text-xs md:text-sm mb-6">
          Hire Kickass Talent with AI Voice Interviews
        </span>

        {/* Heading */}
        <h1 className="text-[31px] md:text-[50px] font-normal leading-tight tracking-tight max-w-5xl">
          Let candidates speak.
          <br /> Talvin will handle the volume
        </h1>

        {/* Description */}
        <p className="mt-6 text-gray-300 text-[16px] max-w-4xl">
          Talvin’s AI Candidate Screening replaces slow, manual phone calls with
          voice-led evaluations — helping you assess hundreds of candidates
          automatically, without compromising on quality
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="https://www.linkedin.com/posts/newan-vinthusa_we-tried-to-break-talvin-ai-recruitment-agent-activity-7316781954832420864-aTEO?utm_source=share&utm_medium=member_desktop&rcm=ACoAAC2w1_oBYj4ONRqyfrW-6b4_V4iNgq5AAU0"
            className="rounded-full flex items-center h-[44px] text-[14px] border border-white/30 bg-white text-black px-4 py-1 font-normal hover:bg-black hover:text-white"
          >
            <span>Try Voice Assessments Free</span>
          </Link>
          <Link
            href="/sign-up"
            className="rounded-full flex items-center h-[44px] text-[14px] border border-white/30 px-4 py-1 hover:bg-white hover:text-black"
          >
            Watch how it works
          </Link>
        </div>

        {/* DEMO FORM */}
        <motion.div
          ref={formRef}
          style={{ y: yMotion }}
          className="mt-10 md:mt-16 hero-form w-full md:max-w-6xl mx-auto overflow-hidden px-2 md:p-12"
        >
          <div className="mt-20 w-full md:max-w-2xl mx-auto rounded-3xl bg-[#FFFFFFA6] backdrop-blur-[5px] shadow-2xl overflow-hidden p-10 md:p-12">
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 text-center">
              Access the Full Demo Video
            </h2>
            <p className="mt-3 text-gray-900 text-center max-w-xl mx-auto">
              We have recorded a detailed walkthrough of the product to
              understand how it works & how it will help you in hiring.
            </p>
            <form className="mt-6 space-y-4 max-w-xl mx-10">
              <input
                type="text"
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="email"
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                type="submit"
                className="w-full rounded-xl bg-black text-white py-2 font-medium hover:bg-gray-900 transition"
              >
                Send me the Video
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
