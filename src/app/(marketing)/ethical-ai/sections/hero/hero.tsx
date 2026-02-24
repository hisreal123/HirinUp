'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import CardList from './card-list';
import Link from 'next/link';

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
    <section className="relative  mt-[-97px]">
      {/* HERO BACKGROUND */}
      <div className="absolute hero-bg inset-0 bg-cover bg-center bg-no-repeat" />
      <div className="absolute hero-overlay inset-0 bg-black/30 bg-cover bg-center bg-no-repeat" />
      {/* HERO CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-32 pb-10 px-6 text-center">
        {/* Badge */}
        <span className="inline-block rounded-full mt-3 md:mt-16 bg-[#171064] border border-[#C3C3C363] px-4 py-2 text-xs md:text-sm mb-6">
          Features
        </span>

        {/* Heading */}
        <h1 className="text-[31px] md:text-[50px] font-normal leading-tight tracking-tight max-w-5xl">
          How to Use AI in Hiring: Ethical <br /> and Legal Guidelines
        </h1>

        {/* Description */}
        <p className="mt-6 text-gray-300 text-[16px] max-w-4xl">
          and Legal Guidelines Unlock the power of AI in your recruitment
          process. Our comprehensive E-Book provides a roadmap to leveraging
          artificial intelligence for hiring, ensuring your practices are not
          only effective but also ethical and legally sound. Discover how to
          navigate the complexities of AI in recruitment and transform your
          hiring strategy for the better.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/sign-up"
            className="rounded-full flex items-center h-[44px] text-[14px] border border-white/30 bg-white text-black px-4 py-1 font-normal hover:bg-black hover:text-white"
          >
            <span>Create a free account</span>
          </Link>
          {/* <Link
            href="/sign-up"
            className="rounded-full flex items-center h-[44px] text-[14px] border border-white/30 px-4 py-1 bg-black hover:bg-white hover:text-black"
          >
            Download Ethical Hiring E-book
          </Link> */}
        </div>

        {/* DEMO FORM */}
        <CardList />
      </div>
    </section>
  );
}
