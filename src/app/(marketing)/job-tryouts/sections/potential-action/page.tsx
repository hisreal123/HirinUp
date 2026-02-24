'use client';

import { motion } from 'framer-motion';
import FeatureItem from './feature-item';
import IndustriesSection from './intdustries-section';

export default function WhyJobTryoutsSection() {
  const fadeUp = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
    },
  };
  
return (
    <section className="w-full py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* ---------- WHY JOB TRYOUTS ---------- */}
        <motion.div
          className="text-center max-w-3xl mx-auto mb-20"
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.span
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="inline-block rounded-full mt-3 md:mt-16 bg-[#171064] border border-[#C3C3C363] px-4 py-2 text-xs md:text-sm mb-6"
          >
            See Potential in Action
          </motion.span>

          <motion.h2
            variants={fadeUp}
            transition={{ delay: 0.2 }}
            className="text-4xl font-semibold text-black mb-4"
          >
            Why Job Tryouts?
          </motion.h2>

          <motion.p
            variants={fadeUp}
            transition={{ delay: 0.3 }}
            className="text-gray-500 text-sm leading-relaxed"
          >
            Job Tryouts let you evaluate candidates in realistic, role-specific
            scenarios — so you're not just hiring based on resumes or
            interviews. Watch how they solve problems, make decisions, and think
            on their feet before bringing them on board.
          </motion.p>
        </motion.div>

        {/* ---------- FEATURE CARDS ---------- */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-28"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.15 }}
        >
          <motion.div variants={fadeUp}>
            <FeatureItem
              icon="/charts/chart-1.webp"
              title="Real Scenarios, Real Reactions"
              desc="Go beyond rehearsed answers. Assess how candidates perform in actual role-based challenges."
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <FeatureItem
              icon="/charts/chart-2.webp"
              title="Role-Specific Grading"
              desc="Talvin's AI scores responses based on criteria that matter for the job — not generic metrics."
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <FeatureItem
              icon="/charts/chart-3.webp"
              title="Save Time & Reduce Bias"
              desc="Instantly shortlist high performers and avoid mis-hires by letting skills speak for themselves."
            />
          </motion.div>
        </motion.div>

        {/* ---------- INDUSTRIES ---------- */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <IndustriesSection />
        </motion.div>
      </div>
    </section>
  );
}
