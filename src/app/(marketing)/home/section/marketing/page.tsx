'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqList } from './data/faqs';
import { blogs } from './data/blogs';
import Accordion from '@/components/ui/accordion';
import CallTOActionLayout from '@/app/(marketing)/layout/cta';

export default function TalvinSection() {
  const leftFaqs = faqList.slice(0, 5);
  const rightFaqs = faqList.slice(5, 10);
  
return (
    <section className="w-full bg-[#F8F8F8] pb-20">
      {/* ================= FAQ ================= */}
      <div className="max-w-7xl mx-auto px-6 pt-28">
        <div className="grid lg:grid-cols-2 mb-15 gap-20">
          <div>
            <span className="inline-flex bg-[#171064] text-white  text-sm font-medium px-4 py-1 rounded-full mb-4">
              FAQ
            </span>
            <h2 className="text-4xl text-black font-semibold leading-tight">
              Everything You <br /> Need to Know
            </h2>
          </div>

          <p className="text-gray-500 max-w-md pt-10 leading-relaxed">
            Got questions? We've got answers! Explore our FAQs to learn how
            Talvin streamlines hiring, automates interviews, and delivers
            data-driven insights to help you make faster, smarter hiring
            decisions with ease.
          </p>
        </div>
        <div className="grid lg:grid-cols-2 gap-4 mt-16">
          {/* LEFT COLUMN */}
          <div className="space-y-3">
            {leftFaqs.map((item, index) => (
              <Accordion
                key={index}
                q={item.q}
                a={item.a}
                defaultOpen={index === 0} // 👈 first item open
              />
            ))}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-3">
            {rightFaqs.map((item, index) => (
              <Accordion
                key={index}
                q={item.q}
                a={item.a}
                defaultOpen={index === 0} // 👈 first item open
              />
            ))}
          </div>
        </div>
      </div>

      {/* ================= BLOGS ================= */}
      <div className="max-w-6xl mx-auto px-6 pt-32 text-center">
        <span className="inline-flex bg-[#171064] text-white text-sm font-medium px-4 py-1 rounded-full mb-4">
          Blogs
        </span>

        <h2 className="text-4xl text-black font-semibold mb-4">
          Insights, Trends & AI-Powered Tips
        </h2>

        <p className="text-gray-500 max-w-3xl mx-auto">
          Stay ahead in recruitment with expert insights, industry trends, and
          AI-driven strategies. Explore our blog for the latest hiring
          innovations.
        </p>

        <div className="mt-16 grid md:grid-cols-3 gap-8 text-left">
          {blogs.map((blog, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              {/* IMAGE CARD */}
              <div
                className="relative h-56 rounded-2xl overflow-hidden bg-cover bg-center"
                style={{ backgroundImage: `url(${blog.image})` }}
              >
                <span className="absolute top-4 border-2 right-4 bg-[rgba(239, 241, 255, 0.2)] text-xs px-3 py-2 backdrop-blur-lg rounded-full font-medium">
                  {blog.date}
                </span>
              </div>

              {/* TEXT BELOW IMAGE */}
              <h4 className="mt-4 text-black text-lg font-medium leading-snug">
                {blog.title}
              </h4>
              <p className="text-black text-lg font-medium mt-1">{blog.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ================= CTA ================= */}
      <CallTOActionLayout />
    </section>
  );
}
