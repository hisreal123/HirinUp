'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import CountUp from 'react-countup';

export function SolutionSection() {
  // Ref for the count-up element
  const countRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(countRef, { once: true, margin: '-100px' }); // trigger a bit early

  // Animation variant for fade-up
  const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <section className="relative overflow-hidden bg-solution bg-black text-white py-12 md:py-32">
      {/* Gradient Background */}

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Top Content */}
        <div className="grid md:grid-cols-[60%_40%] gap-10">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
          >
            <span className="inline-block bg-[#171064] text-white text-sm px-4 py-2 rounded-full mb-4">
              Solution
            </span>

            <h2 className="text-4xl text-[31px] leading-[43px] md:text-[40px] md:leading-[53px] font-normal ">
              AI-Powered Hiring: Faster
              <br />
              Decisions, Better Insights
            </h2>

            <p className="mt-6 text-[#FFFFFFB2] text-[16px] leading-[27px] font-normal">
              Talvin, our AI Recruitment Agent, streamlines hiring by reviewing
              hundreds of candidates in days instead of weeks. It provides deep
              insights beyond resumes, helping you make faster, data-driven
              decisions while reducing manual effort, saving time, and improving
              hiring efficiency.
            </p>
          </motion.div>

          <motion.div
            className="flex justify-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
          >
            <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl">
              <video
                className="w-full h-auto object-cover"
                src="video/circle-1.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
            </div>
          </motion.div>
        </div>

        {/* Case Studies Title */}
        <div className="text-center mt-32">
          <span className="inline-block bg-[#171064] text-white text-sm px-4 py-2 rounded-full mb-4">
            Case Studies
          </span>
          <motion.h3
            className="text-center max-w-4xl mx-auto text-[31px] leading-[40px] md:text-[44px] md:leading-[53px] font-semibold"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
          >
            Transforming Recruitment Efficiency with Talvin AI’s Impact
          </motion.h3>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-[65%_35%] gap-5 mt-16">
          {/* Left Card */}
          <motion.div
            className="bg-[#EFF1FF0D] backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-12"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
          >
            <p className=" text-[16px] leading-[28px] font-medium md:text-xl text-gray-200 mb-6">
              488 Resumes → 15 selected for final interviews in just a week.
            </p>

            <p className="text-[#FFFFFFB2] text-[18px] leading-[30px] md:text-[30px] md:leading-[42px] font-normal">
              “Talvin has been a game changer for us — while we only have 1
              recruiter in the team we are performing as if we have a team of 3+
              with the help of Talvin AI interviews.”
            </p>

            <div className="mt-16 text-left" ref={countRef}>
              {/* Count time reduction */}
              <h4 className="text-[58px] leading-[58px] font-normal">
                {isInView ? <CountUp start={0} end={67} duration={2} /> : 0}% +
              </h4>
              <p className="text-gray-400 text-sm mt-1">
                Hiring Time Reduction
              </p>
            </div>
          </motion.div>

          {/* Right Card */}
          <motion.div
            className="gap-6 flex flex-col"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.5 }}
            variants={fadeUp}
          >
            <div className="backdrop-blur-md border border-white/10 rounded-2xl flex flex-col justify-end">
              <div className="relative w-full h-[376px] overflow-hidden rounded-2xl">
                <iframe
                  src="https://player.vimeo.com/video/1073544808?autoplay=1&playsinline=1&color&autopause=0&loop=1&muted=1&title=0&portrait=1&byline=0#t="
                  className="flex w-full h-full border-none bg-[#00]"
                  frameBorder="0"
                  allow="autoplay"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="bg-[#141414] backdrop-blur-md border border-white/10 rounded-2xl py-6 px-4 flex flex-col justify-end">
              <p className="text-lg text-white font-medium">Beenali Dangalle</p>
              <p className="text-lg text-white font-medium">
                Operations Manager – HR | Code94 Labs
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
