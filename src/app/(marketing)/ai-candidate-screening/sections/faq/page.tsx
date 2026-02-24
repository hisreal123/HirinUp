'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { faqList } from './data/faqs';
import Accordion from '@/components/ui/accordion';
import CallTOActionLayout from '@/app/(marketing)/layout/cta';

export default function FaqSection() {
  const leftFaqs = faqList.slice(0, 4);
  const rightFaqs = faqList.slice(4, 8);
  
return (
    <section className="w-full bg-[#FFFFFF] pb-20">
      {/* ================= FAQ ================= */}
      <div className="max-w-6xl mx-auto  pt-28">
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

      {/* ================= CTA ================= */}
      <CallTOActionLayout />
    </section>
  );
}
