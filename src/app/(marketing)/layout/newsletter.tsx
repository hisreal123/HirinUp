import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Newsletter() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="w-full ">
      {/* ================= NEWSLETTER ================= */}
      <motion.div
        className="border-t bg-[#F5EEFF]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        variants={fadeUp}
      >
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-col lg:flex-row items-center justify-between gap-6">
          <p className="font-semibold text-black text-[23px] leading-[25px]">
            Get Product Updates and Insights
          </p>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <input
              className="border rounded-full px-5 py-3 text-black text-sm sm:w-56"
              placeholder="Enter your full name"
            />
            <input
              className="border rounded-full px-5 py-3 text-black text-sm sm:w-64"
              placeholder="Enter your email address"
            />
            <Link
              href="/sign-up"
              className="bg-[black] text-white md:bg-[#6300ff] md:text-white md:hover:bg-white md:hover:text-black px-6 py-3 rounded-full text-sm"
            >
              Subscribe
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
