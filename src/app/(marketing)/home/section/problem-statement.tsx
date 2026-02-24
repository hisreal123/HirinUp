'use client';

import { motion } from 'framer-motion';

export default function ProblemStatement() {
  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section className="bg-[#F8F8F8] min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-24 text-center">
        {/* Badge */}
        <motion.div
          className="mb-6"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
        >
          <span className="bg-[#171064] text-white px-4 py-2 text-sm font-medium rounded-full">
            Problem Statement
          </span>
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-4xl text-[31px] leading-[40px] md:text-[44px] md:leading-[53px] font-normal text-gray-900"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
        >
          Hiring Top Talent Is Slow and Costly
          <br />
          <span className="">Talvin Fixes That</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          className="
            mx-auto
            mt-6
            max-w-4xl
            text-center
            font-inter
            text-[15px]
            font-normal
            leading-[30px]
            text-[#141414BF]
          "
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          variants={fadeUp}
        >
          Recruiting top talent is time-consuming and costly, making every hire
          critical. Yet, traditional methods fall short—CVs provide limited
          insights, multiple interview rounds slow hiring, and manual screening
          adds expenses, leading to delays in finding the right candidate
          efficiently.
        </motion.p>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-10 mt-24">
          {/* Left Card */}
          <motion.div
            className="bg-purple-50 rounded-2xl  py-12 shadow-sm text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h3 className="text-[28px] font-bold text-black">
              CVs Lack Candidate Insights
            </h3>
            <p className="text-gray-600 text-[14px] font-normal mt-2">
              Just looking at the CV won’t tell you if you should interview them
            </p>

            <img
              src="/user/user-image-1.webp"
              className="rounded-xl mt-12 h-[410px] w-[410px] object-cover mx-auto"
            />
          </motion.div>

          {/* Right Card */}
          <motion.div
            className="bg-purple-50 rounded-2xl py-12 text-center shadow-sm"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
            viewport={{ once: true, amount: 0.5 }}
          >
            <h3 className="text-[28px] font-bold text-black">
              Lengthy Interviews Delay Hiring
            </h3>
            <p className="text-gray-600 text-[14px] font-normal mt-2">
              Multiple rounds of interviews slow you down and add unnecessary
              costs
            </p>

            <img
              src="/user/user-image-2.webp"
              className="rounded-xl mt-12 h-[410px] w-[410px] object-cover mx-auto"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
