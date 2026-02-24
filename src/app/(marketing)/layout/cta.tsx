'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CallTOActionLayout() {
  return (
    <div className="max-w-6xl mx-auto px-6 pt-28 ">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl bg-cta p-4 md:px-14 md:py-16 text-center text-white"
      >
        <h2 className=" text-[26px] leading-[36px]  md:text-[40] md:leading-[53px] font-semibold mb-4">
          Hire Smarter, Faster, and Effortlessly with Talvin
        </h2>
        <p className="text-white/80 md:text-[16px] md:leading-[27px]  mb-10">
          Stop wasting time on slow, outdated hiring processes. Let Talvin
          automate interviews, analyze candidates, and streamline recruitment—so
          you can focus on hiring top talent with confidence. Try Talvin today
          and supercharge your hiring!
        </p>

        <div className="flex  justify-center gap-4">
          {/* <button className="bg-white text-[14px] text-black hover:bg-black hover:text-white hover:border hover:border-gray-400 px-4 py-3 rounded-full font-medium">
            Hire Smart with Talvin
          </button> */}
          <Link
            href="/book-a-demo"
            className="border text-[14px] border-white/40 px-4 py-3 rounded-full"
          >
            Book a Demo
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
