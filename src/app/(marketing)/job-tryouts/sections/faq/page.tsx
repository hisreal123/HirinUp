'use client';

import { motion } from 'framer-motion';
import { faqList } from './data/faqs';
import Accordion from '@/components/ui/accordion';
import CallTOActionLayout from '@/app/(marketing)/layout/cta';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function FaqSection() {
  const leftFaqs = faqList.slice(0, 4);
  const rightFaqs = faqList.slice(4, 8);

  return (
    <section className="w-full bg-[#FFFFFF] pb-20">
      {/* ================= FAQ ================= */}
      <div className="max-w-6xl mx-auto pt-28 px-6">
        {/* Header */}
        <motion.div
          className="grid lg:grid-cols-2 gap-6 md:gap-8 lg:gap-20  mb-15"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          variants={fadeUp}
        >
          <div>
            <span className="inline-flex bg-[#171064] text-white text-sm font-medium px-4 py-1 rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-4xl text-black font-semibold leading-tight">
              Everything You <br /> Need to Know
            </h2>
          </div>

          <p className="text-gray-500 max-w-md leading-relaxed">
            Got questions? We've got answers! Explore our FAQs to learn how
            Talvin streamlines hiring, automates interviews, and delivers
            data-driven insights to help you make faster, smarter hiring
            decisions with ease.
          </p>
        </motion.div>

        {/* FAQ Lists */}
        <motion.div
          className="grid lg:grid-cols-2 gap-4 mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ staggerChildren: 0.12 }}
        >
          {/* LEFT COLUMN */}
          <motion.div variants={fadeUp} className="space-y-3">
            {leftFaqs.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                transition={{ delay: index * 0.05 }}
              >
                <Accordion q={item.q} a={item.a} defaultOpen={index === 0} />
              </motion.div>
            ))}
          </motion.div>

          {/* RIGHT COLUMN */}
          <motion.div variants={fadeUp} className="space-y-3">
            {rightFaqs.map((item, index) => (
              <motion.div
                key={index}
                variants={fadeUp}
                transition={{ delay: index * 0.05 }}
              >
                <Accordion q={item.q} a={item.a} defaultOpen={index === 0} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
      {/* ================= CTA ================= */}
      <CallTOActionLayout />
    </section>
  );
}
