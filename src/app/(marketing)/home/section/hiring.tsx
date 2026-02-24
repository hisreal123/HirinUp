'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 },
};

export default function HiringSection() {
  return (
    <section className="relative w-full bg-hiring overflow-hidden  text-white px-4 sm:px-6 py-24 sm:py-32">
      <div className="relative mx-auto max-w-6xl">
        {/* HEADER */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <span className="mb-4 inline-flex rounded-full bg-[#171064] text-white  px-4 py-2 text-sm font-mediumpx-4 ">
            Features
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium">
            Smart Hiring, Scaled Effortlessly
          </h1>
        </motion.div>

        {/* FEATURES GRID */}
        <div className="mb-24 max-w-4xl mx-auto">
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
            {[
              {
                title: 'Scale Interviews Effortlessly',
                desc: 'Interview at scale, run more than 100 interviews a day',
                image: 'card-logo/card-logo-1.webp',
              },
              {
                title: '24/7 AI-Powered Hiring',
                desc: 'Talvin doesn’t sleep, run interviews 24/7',
                image: 'card-logo/card-logo-2.webp',
              },
              {
                title: 'Automated Reference Checks',
                desc: 'AI agent that calls references and gets insights on autopilot',
                image: 'card-logo/card-logo-3.webp',
              },
              {
                title: 'Secured Candidate Data',
                desc: 'Talvin protects candidate information with encryption',
                image: 'card-logo/card-logo-4.webp',
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-6 rounded-2xl border border-white/10 bg-[#EFF1FF29] p-5 sm:p-8 backdrop-blur-xl"
              >
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-medium">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/80">{item.desc}</p>
                </div>

                <img
                  src={item.image}
                  alt={item.title}
                  className="h-10 w-10 sm:h-[52px] sm:w-[52px]"
                />
              </motion.div>
            ))}
          </div>
        </div>

        {/* COMPARISON INTRO */}
        <div className="mb-12 grid gap-10 md:grid-cols-2 md:items-center">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible">
            <span className="mb-4 inline-flex rounded-full bg-[#171064] text-white  px-4 py-2 text-sm font-medium ">
              Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold leading-tight">
              Effortless High-Volume
              <br className="hidden sm:block" />
              Hiring New vs Old
            </h2>
          </motion.div>

          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            className="text-base text-[#FFFFFF99] leading-[27px]"
          >
            We considered a competitor comparison, but no one matches Talvin’s
            efficiency and innovation. Instead, we’re showcasing a fresh
            perspective—how our AI-driven hiring process outperforms traditional
            methods and redefines recruitment standards. 😇
            <div className="mt-6">
              <Link
                href="/sign-up"
                className="w-full sm:w-auto rounded-full bg-white px-6 py-2 text-sm font-medium text-black"
              >
                Hire Smart with Talvin
              </Link>
            </div>
          </motion.div>
        </div>

        {/* COMPARISON TABLE */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          {/* Mobile horizontal scroll wrapper */}
          <div className="overflow-x-auto">
            <div className="rounded-3xl min-w-[900px] max-w-5xl mx-auto border border-white/10 bg-white/5 px-6 sm:px-8 py-8 sm:py-10 backdrop-blur">
              {/* Header */}
              <div className="grid grid-cols-[30%_35%_35%] items-center text-base sm:text-lg font-medium text-white">
                <div className="p-4 sm:p-6 pl-0">Aspect</div>
                <div className="p-4 sm:p-6 border-x-2 border-white/30">
                  Old Hiring Process
                </div>
                <div className="p-4 sm:p-6">New Hiring Process with Talvin</div>
              </div>

              {/* Rows */}
              <div className="grid grid-cols-[30%_35%_35%] text-xs sm:text-sm leading-relaxed text-white/70">
                {/* Screening Time */}
                <div className="flex items-center p-4 sm:p-6 pl-0">
                  <span className="rounded-full border border-white/15 bg-white/5 px-4 py-3 w-[205px]">
                    Screening Time
                  </span>
                </div>
                <div className="border-x-2 border-white/30 p-4 sm:p-6">
                  Takes 7–10 days to manually review a candidate.
                </div>
                <div className="p-4 sm:p-6 text-white/90">
                  AI screens candidates in &lt;24 hours
                </div>

                {/* Reference Checks */}
                <div className="flex items-center p-4 sm:p-6 pl-0">
                  <span className="rounded-full border border-white/15 bg-white/5 px-4 py-3 w-[205px]">
                    Reference Checks
                  </span>
                </div>
                <div className="border-x-2 border-white/30 p-4 sm:p-6">
                  65% of hiring delays come from slow reference calls
                </div>
                <div className="p-4 sm:p-6 text-white/90">
                  AI agents complete reference checks 3× faster
                </div>

                {/* Speed to Hire */}
                <div className="flex items-center p-4 sm:p-6 pl-0">
                  <span className="rounded-full border border-white/15 bg-white/5 px-4 py-3 w-[205px]">
                    Speed to Hire
                  </span>
                </div>
                <div className="border-x-2 border-white/30 p-4 sm:p-6">
                  30–45 days to fill a position
                </div>
                <div className="p-4 sm:p-6 text-white/90">
                  Cut hiring time by 50% with AI automation
                </div>

                {/* Bias */}
                <div className="flex items-center p-4 sm:p-6 pl-0">
                  <span className="rounded-full border border-white/15 bg-white/5 px-4 py-3 w-[205px]">
                    Bias & Consistency
                  </span>
                </div>
                <div className="border-x-2 border-white/30 p-4 sm:p-6">
                  42% of recruiters admit unconscious bias
                </div>
                <div className="p-4 sm:p-6 text-white/90">
                  AI ensures 100% objective and structured assessments
                </div>

                {/* Candidate Experience */}
                <div className="flex items-center p-4 sm:p-6 pl-0">
                  <span className="rounded-full border border-white/15 bg-white/5 px-4 py-3 w-[205px]">
                    Candidate Experience
                  </span>
                </div>
                <div className="border-x-2 border-white/30 p-4 sm:p-6">
                  60% of candidates drop off due to long hiring cycles
                </div>
                <div className="p-4 sm:p-6 text-white/90">
                  Faster process leads to higher offer acceptance rates
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
