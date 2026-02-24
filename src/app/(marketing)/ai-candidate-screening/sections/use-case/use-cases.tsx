'use client';

import { motion } from 'framer-motion';
import IntegrationsCarousel from './logo-swipper';

/**
 * FINAL FIX (IMAGE-ACCURATE)
 * --------------------------------------
 * ✔ Left text STICKY
 * ✔ Sticky stops at bottom of right cards
 * ✔ Right cards scroll normally
 * ✔ Cards slide RIGHT → LEFT + fade on scroll
 * ✔ Full background + glow design
 */

export default function TalvinUseCasesSection() {
  return (
    <section className="relative bg-candidate-use-case py-32">
      {/* BACKGROUND GLOWS */}
      <div className="relative mx-auto max-w-6xl ">
        {/* GRID: LEFT STICKY + RIGHT SCROLLING CARDS */}
        <div className="lg:grid lg:grid-cols-[60%_40%] lg:gap-6 items-start">
          {/* LEFT STICKY */}
          <div className="sticky top-2 self-start max-w-full mb-12 lg:mb-0">
            <span className="inline-block rounded-full  bg-[#171064] border border-[#C3C3C363] px-4 py-2 text-xs md:text-sm mb-6">
              Use Cases
            </span>

            <h2 className="mt-6 text-[38px] font-semibold leading-tight text-white">
              Talvin is built to scale with you — no matter the industry,
              function, or volume.
            </h2>

            <p className="mt-6 text-[15px] leading-relaxed text-white/60">
              Whether you're hiring 10 or 10,000, Talvin’s AI Candidate
              Screening and Voice Assessments adapt to your needs. From
              frontline roles to tech-driven positions, Talvin helps you assess
              what really matters — how candidates think, speak, and solve
              problems.
            </p>
          </div>

          {/* RIGHT CARDS */}
          <div className="flex flex-col space-y-7">
            <UseCaseCard
              index="1."
              title="Fast-paced, high-volumes hiring environments"
              desc="Handle thousands of applications in hours, without losing quality or consistency."
            />
            <UseCaseCard
              index="2."
              title="Roles requiring strong communication and decision-making"
              desc="Go beyond resumes to see how candidates actually think, speak, and solve problems."
            />
            <UseCaseCard
              index="3."
              title="Teams looking to reduce screening time without sacrificing quality"
              desc="Cut manual calls by 90% while still finding better-fit candidates every time."
            />
            <UseCaseCard
              index="4."
              title="Agencies managing recruitment across multiple industries"
              desc="Scale smarter with AI assessments that adapt to any role, sector, or client demand."
            />
          </div>
        </div>
        {/* ENTERPRISE SECTION */}
        <div className="relative pb-40 pt-32 text-center">
          <span className="inline-block rounded-full mt-3 md:mt-16 bg-[#171064] border border-[#C3C3C363] px-4 py-2 text-xs md:text-sm mb-6">
            Built for Enterprise
          </span>

          <h3 className="mt-4 text-4xl font-semibold text-white">
            Enterprise-grade hiring,
            <br className="hidden md:block" /> built for scale.
          </h3>

          <p className="mx-auto mt-4 max-w-3xl text-base text-white/60">
            From seamless integrations with your ATS to advanced fraud
            prevention, Talvin is designed to handle the complexity, compliance,
            and scale of enterprise recruitment without compromise.
          </p>

          <div className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Integrations */}
            <div className="rounded-2xl border border-white/10 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.25),rgba(255,255,255,0.05))] shadow-[0_0_10px_0_rgba(0,0,0,0.06)]  px-6 py-12 backdrop-blur-xl">
              <h4 className="text-[30px] leading-[31px] font-medium text-white">
                Integrations
              </h4>
              <div className="max-w-md  mx-auto relative">
                <p className="mt-2  text-sm text-white/60">
                  Talvin integrates with Ashby, Teamtailor, SAP SuccessFactors,
                  Recruitee, Manatala, Greenhouse, Workable, Workday, and much
                  more!
                </p>
              </div>

              <div className="relative mt-8 flex  items-center justify-center overflow-hidden rounded-xl">
                <IntegrationsCarousel />
              </div>
            </div>

            {/* Fraud */}
            <div className="relative rounded-2xl border border-white/10 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.25),rgba(255,255,255,0.05))] shadow-[0_0_10px_0_rgba(0,0,0,0.06)]  px-6 py-12  backdrop-blur-xl">
              <h4 className="text-[30px] leading-[31px] font-medium text-white">
                Built-in fraud prevention
              </h4>
              <div className="max-w-md  mx-auto relative">
                <p className="mt-2 text-sm text-white/60">
                  With Talvin, every interview is protected. Candidates are
                  verified through real-time video, activity monitoring, and
                  one-time access, ensuring results you can trust without
                  compromise.
                </p>
              </div>
              <div className="relative mt-8 flex  items-center justify-center overflow-hidden rounded-xl">
                <img
                  src="/enterprise/Frame-2147226033.webp"
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UseCaseCard({ index, title, desc }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 80 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-120px' }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="rounded-2xl border border-white/10 bg-[linear-gradient(to_bottom_right,rgba(255,255,255,0.25),rgba(255,255,255,0.05))] p-8 shadow-[0_0_14px_rgba(0,0,0,0.45)] backdrop-blur-xl"
    >
      <div className="text-[60px] font-medium text-white leading-[52px]">
        {index}
      </div>
      <h3 className="mt-3 text-xl font-medium text-white">{title}</h3>
      <p className="mt-2 text-base leading-[28px] text-white/60">{desc}</p>
    </motion.div>
  );
}
