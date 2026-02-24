'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';
import DemoForm from './demoForm';

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
          Hire Kickass Talent with AI Voice Interviews
        </span>

        {/* Heading */}
        <h1 className="text-[31px] md:text-[50px] font-normal leading-tight tracking-tight max-w-5xl">
          We Eliminate Screening Interviews with AI
        </h1>

        {/* Description */}
        <p className="mt-6 text-gray-300 text-[16px] max-w-4xl">
          CVs don’t tell stories — voices do. Regardless of volume, Talvin’s AI
          Voice Assessment helps enterprises screen candidates automatically.
          Start hiring in volume without expanding your recruitment team.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            target="blank"
            href="/sign-up"
            className="rounded-full  h-[44px] text-[14px] border border-white/30 bg-white text-black px-4 py-2.5 font-normal hover:bg-black hover:text-white"
          >
            <span>Create a free account</span>
          </Link>
          {/* <button className="rounded-full h-[44px] text-[14px] border border-white/30 px-4 py-1 hover:bg-white hover:text-black">
            Discover Talvin
          </button> */}
        </div>

        {/* TRUSTED */}
        <div className="mt-14 flex flex-col sm:flex-row items-center gap-6">
          <span className="text-base sm:text-lg whitespace-nowrap">
            Trusted by enterprises globally
          </span>

          <div className="flex items-center gap-6 flex-wrap justify-center">
            {[
              {
                src: '/trusted-logos/trusted-logo-1.png',
                name: 'ANYTIME FITNESS',
              },
              { src: '/trusted-logos/trusted-logo-2.png', name: 'MAVI' },
              { src: '/trusted-logos/trusted-logo-3.png', name: 'JXG' },
            ].map((logo, index) => (
              <div key={index} className="relative group">
                <motion.img
                  src={logo.src}
                  alt={logo.name}
                  className="h-14 sm:h-20 md:h-24 object-contain"
                  whileHover={{ y: -6 }}
                />
                <span className="absolute -bottom-6 text-xs bg-black p-2 rounded text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                  {logo.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* DEMO FORM */}
        <motion.div
          ref={formRef}
          style={{ y: yMotion }}
          className="mt-10 md:mt-32 hero-form w-full md:max-w-6xl mx-auto overflow-hidden  px-2 md:p-12"
        >
          <div className="mt-20 w-full md:max-w-2xl mx-auto rounded-3xl bg-[#FFFFFFA6] backdrop-blur-[5px] shadow-2xl overflow-hidden px-6 py-16  md:p-12">
            <h2 className="text-2xl md:text-3xl font-medium text-gray-900 text-center">
              Access the Full Demo Video
            </h2>
            <p className="mt-3 text-gray-900 text-center max-w-xl mx-auto">
              We have recorded a detailed walkthrough of the product to
              understand how it works & how it will help you in hiring.
            </p>
            <DemoForm />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
