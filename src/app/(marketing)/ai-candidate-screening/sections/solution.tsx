'use client';

import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0 },
};

export default function SolutionSection() {
  return (
    <>
      <section className="relative w-full bg-candidate-solution overflow-hidden  text-white px-4 sm:px-6 py-14 sm:py-18">
        <div className="relative mx-auto max-w-6xl">
          {/* HEADER */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="mb-16 text-center"
          >
            <span className="inline-block rounded-full mt-3 md:mt-16 bg-[#171064] border border-[#C3C3C363] px-4 py-2 text-xs md:text-sm mb-6">
              Solution
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium">
              A better way to screen, assess, and hire.
            </h1>
          </motion.div>

          {/* FEATURES GRID */}
          <div className="mb-24 max-w-6xl mx-auto">
            <div className="grid gap-3 sm:gap-5 md:grid-cols-3">
              {[
                {
                  title: '90% Time Saved',
                  desc: 'Reduce hours of interviews with one of the fastest candidate assessment tools on the market.',
                  image: 'card-logo/card-logo-1.webp',
                },
                {
                  title: 'Beyond the Resume',
                  desc: 'Evaluate how candidates think, communicate, and solve problems — not just what’s written on paper',
                  image: 'card-logo/card-logo-2.webp',
                },
                {
                  title: 'Consistent + Fair',
                  desc: 'All candidates get the same questions, same time, and same evaluation. Bias goes out the window.',
                  image: 'card-logo/card-logo-3.webp',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.25),rgba(255,255,255,0.05))] flex flex-col sm:flex-row gap-4 sm:gap-6 items-center shadow-[0_0_10px_0_rgba(0,0,0,0.06)]  rounded-2xl border border-[#EFF1FF42] p-3 sm:p-6 backdrop-blur-xl"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-10 w-10 sm:h-[52px] sm:w-[52px]"
                  />
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg font-medium">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-white/80">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="relative w-full bg-white overflow-hidden  text-black px-4 sm:px-6 py-20 sm:py-18">
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-4 sm:gap-12 md:grid-cols-2 ">
            <div className="text-center ">
              <motion.h3
                className="text-center items-center text-[31px] leading-[40px] md:text-[44px] md:leading-[53px] font-normal"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.5 }}
                variants={fadeUp}
              >
                Don’t take our word for it! Hear it from our partners
              </motion.h3>
            </div>
            <motion.div
              className=""
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
              variants={fadeUp}
            >
              <p className=" text-[16px] leading-[28px] font-normal md:text-[18px] md:leading-[34px] text-[#141414] mb-2">
                488 Resumes → 15 selected for final interviews in just a week.
              </p>

              <p className="text-[#141414C4] text-[18px] leading-[30px] md:text-[24px] md:leading-[38px] font-normal italic">
                "We cut screening time by 80% and still hired better people.
                Talvin’s voice assessments felt like having 10 recruiters
                working around the clock."
              </p>

              <div className="bg-white backdrop-blur-md border border-gray-200 rounded-2xl py-2 px-4 flex flex-col justify-end">
                <p className="text-lg text-black font-medium">
                  Beenali Dangalle
                </p>
                <p className="text-base text-black font-normal italic">
                  Hiring Manager | Code94 Labs
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
