'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { SolutionSection } from './section/solution';
import SallySection from './section/sally/sally';
import HiringSection from './section/hiring';
import TimerSection from './section/timer/page';
import MarketingSection from './section/marketing/page';
import ProblemStatement from './section/problem-statement';
import HeroSection from './section/hero/page';
export default function Home() {
  return (
    <>
      {/* TOP ANNOUNCEMENT */}
      {/* HERO SECTION */}
      <HeroSection />
      {/* PROBLEM STATEMENT */}
      <ProblemStatement />
      {/* SOLUTION SECTION */}
      <SolutionSection />
      {/* SALLY SECTION */}
      <SallySection />
      {/* HIRING SECTION */}
      <HiringSection />
      {/* TIMER SECTION */}
      <TimerSection />
      {/* MARKETING SECTION */}
      <MarketingSection />
      {/* FOOTER SECTION */}
    </>
  );
}
