'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import CallTOActionLayout from '@/app/(marketing)/layout/cta';
import Link from 'next/link';

export default function HiringEvolutionSection() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="w-full bg-white pb-20">
      <div className="max-w-6xl mx-auto px-6 py-20">
        {/* ================= Heading ================= */}
        <div className="text-center max-w-5xl mx-auto">
          <h2 className="text-[28px] md:text-[42px] md:leading-[53px] font-normal text-[#0F172A] ">
            The evolution of hiring over the past two decades
          </h2>

          <p className="mt-4 text-[15px] p-4 leading-relaxed text-[#475569]">
            Recruitment has undergone a dramatic shift in the last two decades,
            moving from traditional, manual methods to a highly digital and
            data-driven approach. This evolution, driven by technological
            advancements and changing workforce dynamics, has reshaped how
            companies attract, assess, and hire talent.
          </p>

          <p className="mt-4 text-[15px] leading-relaxed p-4 text-[#475569]">
            From the rise of video interviews to the emphasis on data-driven
            decisions, modern recruitment is all about efficiency, strategic
            partnerships, and an enhanced candidate experience. AI tools are now
            at the forefront, automating tasks like candidate screening and
            assessment, freeing up recruiters to focus on high-value
            interactions and strategic hiring.
          </p>
        </div>

        {/* ================= Image Row ================= */}
        <div className="relative mt-16 flex justify-center">
          <div className="relative w-full max-w-6xl">
            <Image
              src="/ethical-ai-1.webp"
              alt="Hiring evolution UI"
              width={1200}
              height={600}
              className="rounded-xl w-full h-auto max-w-full"
            />
          </div>
        </div>

        {/* ================= Purple Card ================= */}
        <div className="mt-20">
          <div className="bg-[linear-gradient(90deg,#171064_-0.14%,#6300FF_100%)] max-w-6xl mx-auto rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-white md:text-[44px] font-medium  md:leading-[53px]">
                The Ethical and Legal Playbook for <br /> Using AI in Hiring
              </h3>
              <p className="mt-3 text-[14px] text-white ">
                A Practical Guide to Building Fair, Transparent, and Compliant
                Recruitment Processes
              </p>

              <Link
                href="/sign-up"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-[14px] font-medium text-[#4F46E5] hover:bg-white/90 transition"
              >
                Download Ethical Hiring eBook
              </Link>
            </div>

            <div className="hidden md:block">
              <Image
                src="/Vector-1.webp"
                alt="Analytics"
                width={220}
                height={220}
              />
            </div>
          </div>
        </div>

        {/* ================= Ethical Dilemma ================= */}
        <div className=" mt-28 grid md:grid-cols-[minmax(0,45%)_minmax(0,55%)] gap-6 min-w-0">
          <Image
            src="/Component-1-1024x823.webp"
            alt="AI Ethics"
            width={520}
            height={360}
            className="rounded-xl w-full h-auto max-w-full"
          />

          <div className="min-w-0">
            <h4 className="text-[22px] md:text-[44px] md:leading-[53px]  font-normal text-[#0F172A]">
              How to use AI in Hiring: The ethical dilemma
            </h4>
            <p className="mt-4 text-[15px] leading-[30px] text-[#475569]">
              While AI offers incredible efficiency in recruitment, it also
              raises significant ethical concerns, particularly around bias and
              fairness. AI systems, trained on historical data, can
              inadvertently perpetuate existing human biases, leading to unfair
              hiring practices. The key to ethical AI in hiring isn't to abandon
              it, but to use it smartly, hand-in-hand with human judgment.
            </p>
            <p className="mt-4 text-[15px] leading-[30px] text-[#475569]">
              While AI offers incredible efficiency in recruitment, it also
              raises significant ethical concerns, particularly around bias and
              fairness. AI systems, trained on historical data, can
              inadvertently perpetuate existing human biases, leading to unfair
              hiring practices. The key to ethical AI in hiring isn't to abandon
              it, but to use it smartly, hand-in-hand with human judgment.
            </p>
          </div>
        </div>

        {/* ================= Legal Considerations ================= */}
        <div className="mt-28 grid md:grid-cols-[minmax(0,55%)_minmax(0,45%)] gap-12 min-w-0 items-center">
          <div className="min-w-0">
            <h4 className="text-[22px] md:text-[44px] md:leading-[53px] font-normal text-[#0F172A]">
              How to use AI in Hiring: <br /> Legal considerations
            </h4>
            <p className="mt-4 text-[15px]leading-[30px] font-light text-[#475569]">
              Using AI in recruitment comes with a complex web of legal
              considerations, particularly concerning bias and discrimination.
              Companies must be vigilant to ensure their AI tools comply with
              laws like the Americans with Disabilities Act (ADA) and the Equal
              Employment Opportunity (EEO) Act. Key legal risks include
              inadvertent bias in AI filters, privacy concerns related to data
              storage and usage, and increasing scrutiny from federal and state
              laws.
            </p>
            <p className="mt-4 text-[15px]leading-[30px] font-light text-[#475569]">
              Transparency with candidates about AI use and obtaining consent
              are also crucial. The solution lies in using diverse and unbiased
              training data, regular AI system audits, clear ethical guidelines,
              and balancing AI automation with human judgment to ensure fairness
              and compliance in an evolving legal landscape.
            </p>
          </div>

          <Image
            src="/Component-2-1024x762.webp"
            alt="Legal AI"
            width={560}
            height={416}
            className="rounded-xl w-full h-auto max-w-full"
          />
        </div>
      </div>
      {/* ================= CTA ================= */}
      <CallTOActionLayout />
    </section>
  );
}
