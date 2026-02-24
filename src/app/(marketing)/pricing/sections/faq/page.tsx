'use client';

import { motion } from 'framer-motion';
import { faqList } from './data/faqs';
import Accordion from '@/components/ui/accordion';
import Link from 'next/link';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function FaqSection() {
  const leftFaqs = faqList;

  return (
    <section className="w-full bg-[#FFFFFF] pb-20">
      {/* ================= FAQ ================= */}
      <div className="max-w-6xl mx-auto px-6 pt-28 items-center justify-center ">
        {/* Header */}
        <motion.div
          className="text-center "
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          variants={fadeUp}
        >
          <div>
            <span className="inline-flex bg-[#171064] text-white text-sm font-medium px-4 py-2 rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-4xl text-black font-semibold leading-tight">
              Everything You Need to Know
            </h2>
          </div>
        </motion.div>

        {/* FAQ Lists */}
        <motion.div
          className="max-w-2xl mx-auto mt-16 space-y-6"
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
                <Accordion q={item.q} a={item.a} />
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ================= CTA ================= */}
      <div className="max-w-6xl mx-auto px-6 pt-28 ">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="rounded-2xl bg-cta px-14 py-16 text-center text-white"
        >
          <h2 className="text-4xl font-semibold mb-4">
            Need a Custom Hiring Solution?
          </h2>
          <p className="text-white/80 max-w-3xl mx-auto mb-10">
            For high-growth teams with complex hiring needs, our Enterprise Plan
            offers tailored features, higher usage limits, dedicated support,
            and advanced analytics. Let us build a solution that fits your
            workflow and scales with your goals.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/sign-up"
              className="border border-white/40 px-6 py-3 rounded-full"
            >
              Request Enterprise Plan
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
