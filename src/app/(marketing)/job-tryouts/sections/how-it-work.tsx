'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import Link from 'next/link';

const steps = [
  {
    id: '01',
    title: 'Pick a Role Template',
    desc: 'Choose from a growing library of role-based tryouts (e.g., Sales Rep, Customer Support, Hospitality).',
    image: '/job/mask-1.webp',
  },
  {
    id: '02',
    title: 'Customize the Scenario',
    desc: 'Tailor the prompts or questions to match your company’s real work environment.',
    image: '/job/mask-2.webp',
  },
  {
    id: '03',
    title: 'Candidate Completes the Tryout',
    desc: 'Candidates respond via voice or video, in a simulated task environment.',
    image: '/job/mask-3.webp',
  },
  {
    id: '04',
    title: 'AI Grades & Analyzes',
    desc: 'Talvin evaluates the responses for decision-making, communication, creativity, and job-fit — and delivers a report instantly.',
    image: '/job/mask-4.webp',
  },
];

// Animation presets
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

export default function HowJobTryoutsWork() {
  return (
    <section className="relative w-full overflow-hidden bg-candidate-how-it-works">
      <div className="relative mx-auto max-w-[1180px] px-6 py-32">
        {/* ---------- HEADER ---------- */}
        <motion.div
          className="flex flex-col lg:flex-row justify-between items-start gap-10 mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          variants={fadeUp}
        >
          <div>
            <span className="inline-block rounded-full bg-[#171064] border border-[#C3C3C363] px-4 text-xs md:text-sm mb-6">
              How It Works
            </span>
            <h2 className="text-4xl text-white font-semibold leading-tight">
              How Job Tryouts Work
            </h2>
          </div>

          <p className="max-w-lg text-[#FFFFFF99] text-[14px] leading-[24px] font-normal">
            We simulate real-world challenges based on the role. Candidates
            respond via voice, and our AI evaluates their performance for
            clarity, logic, and role fit—giving you a graded, insight-rich
            report to make smarter hiring decisions.
          </p>
        </motion.div>

        {/* ---------- STEPS ---------- */}
        <div className="max-w-4xl mx-auto mt-10">
          <div className="space-y-24">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-120px' }}
                transition={{
                  duration: 0.6,
                  ease: 'easeOut',
                  delay: index * 0.05,
                }}
                variants={fadeUp}
                className="pb-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-[460px_1fr] gap-x-10 items-stretch">
                  {/* Image */}
                  <motion.div
                    variants={fadeUp}
                    transition={{ delay: 0.1 }}
                    className="relative h-[260px] sm:h-[300px] w-full lg:w-[460px] overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={step.image}
                      alt={step.title}
                      className="object-cover"
                      fill
                    />
                  </motion.div>

                  {/* Content */}
                  <motion.div
                    variants={fadeUp}
                    transition={{ delay: 0.2 }}
                    className="flex h-full"
                  >
                    <div className="flex w-full flex-col justify-center">
                      <div className="flex flex-col">
                        {/* ID */}
                        <div className="mb-6">
                          <div className="h-10 w-14 flex items-center justify-center rounded-full bg-[#18181a] border border-white/20 text-lg text-white">
                            {step.id}
                          </div>
                        </div>

                        {/* Text */}
                        <h3 className="text-[20px] sm:text-[22px] font-semibold leading-tight text-white">
                          {step.title}
                        </h3>

                        <p className="mt-2 max-w-[420px] text-[14px] leading-[1.6] text-white/60">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <hr className="mt-10 border-t border-white/20" />
              </motion.div>
            ))}
          </div>

          {/* ---------- CTA ---------- */}
          <motion.div
            className="mt-24 flex justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            variants={fadeUp}
          >
            <Link
              href="/sign-up"
              className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Create An Account
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
