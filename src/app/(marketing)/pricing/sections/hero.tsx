'use client';

import { useScroll, useTransform } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { InfoCircledIcon } from '@radix-ui/react-icons';
import Link from 'next/link';

const pricing = {
  monthly: [
    {
      name: 'Startup',
      price: 175,
      desc: 'Perfect for early-stage teams',
      features: [
        '50 interviews monthly',
        '1 User',
        '2 Active Jobs / Assessments',
      ],
    },
    {
      name: 'Growth',
      price: 325,
      desc: 'More interviews, more users, and more jobs',
      badge: 'Popular',
      features: [
        '100 interviews monthly',
        'Up to 3 Users',
        'Up to 25 Active Jobs / Assessments',
      ],
      highlight: true,
    },
    {
      name: 'Scaled',
      price: 750,
      desc: 'Maximize hiring efficiency for recruitment',
      features: [
        '250 interviews monthly',
        'Up to 5 Users',
        'Unlimited Jobs / Assessments',
      ],
    },
  ],
  annually: [
    {
      name: 'Startup',
      price: '1,925',
      desc: 'Perfect for early-stage teams',
      features: [
        '50 interviews monthly',
        '1 User',
        '2 Active Jobs / Assessments',
        'Guided Onboarding Experience',
      ],
    },
    {
      name: 'Growth',
      price: '3,575',
      desc: 'More interviews, more users, and more jobs',
      badge: 'Popular',
      features: [
        '100 interviews monthly',
        'Up to 3 Users',
        'Up to 25 Active Jobs / Assessments',
        'Guided Onboarding Experience',
      ],
      highlight: true,
    },
    {
      name: 'Scaled',
      price: '8,250',
      desc: 'Maximize hiring efficiency for recruitment',
      features: [
        '250 interviews monthly',
        'Up to 5 Users',
        'Unlimited Jobs / Assessments',
        'Guided Onboarding Experience',
      ],
    },
  ],
};
export default function HeroSection() {
  const formRef = useRef<HTMLDivElement>(null);
  const [formTop, setFormTop] = useState(0);

  const { scrollY } = useScroll();

  const [billing, setBilling] = useState<'monthly' | 'annually'>('monthly');
  const plans = pricing[billing];

  // Track form top position relative to page
  useEffect(() => {
    if (formRef.current) {
      const rect = formRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || window.pageYOffset;
      setFormTop(rect.top + scrollTop);
    }
  }, []);

  // Map scrollY relative to form position to small vertical motion
  // Moves ±30px as page scrolls
  const yMotion = useTransform(
    scrollY,
    [formTop - 500, formTop + 500],
    [30, -30]
  );

  return (
    <section className="relative min-h-screen mt-[-97px]">
      {/* HERO BACKGROUND */}
      <div className="absolute pricing-hero-bg inset-0 bg-cover bg-center bg-no-repeat" />

      {/* HERO CONTENT */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-32 pb-10 px-6 text-center">
        {/* Badge */}
        <span className="inline-block rounded-full mt-3 md:mt-16 bg-[#171064] border border-[#C3C3C363] px-4 py-2 text-xs md:text-sm mb-6">
          Pricing
        </span>

        {/* Heading */}
        <h1 className="text-[43px] md:text-[56px] font-normal leading-[60px] md:leading-[74px] tracking-tight max-w-5xl">
          Flexible Pricing for Smarter Hiring
        </h1>

        {/* Description */}
        <p className="mt-6 text-gray-300 text-[16px] max-w-4xl">
          First 14-day money-back guarantee → no questions asked. Introduction
          price for first 25 customers
        </p>

        <div className="flex justify-center mt-16 mb-16">
          <div className="flex items-center rounded-full border border-white  p-1">
            <button
              className={clsx(
                'px-9 py-4 text-base rounded-full transition',
                billing === 'monthly'
                  ? 'bg-[linear-gradient(80deg,#171064_0%,#6300FF_100%)] text-white'
                  : 'text-white hover:text-white'
              )}
              onClick={() => setBilling('monthly')}
            >
              Monthly
            </button>
            <button
              className={clsx(
                'px-9 py-4 text-base rounded-full transition',
                billing === 'annually'
                  ? 'bg-[linear-gradient(80deg,#171064_0%,#6300FF_100%)] text-white'
                  : 'text-white hover:text-white'
              )}
              onClick={() => setBilling('annually')}
            >
              Annually
              <span className="ml-3 text-[11px] font-medium px-2 py-1 border border-white rounded-full bg-white/10 text-white">
                1 MONTH FREE
              </span>
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="w-full px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 ">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={clsx(
                  'relative rounded-2xl border border-[#171064] p-10 backdrop-blur-xl',
                  plan.highlight
                    ? 'bg-pricing-growth scale-105 shadow-[0_0_80px_rgba(124,58,237,0.6)]'
                    : 'bg-[#000000]'
                )}
              >
                {plan.badge && (
                  <span className="absolute top-6 right-6 text-xs px-3 py-1 rounded-full bg-white/20 text-white">
                    Popular
                  </span>
                )}

                <h3 className="text-white text-left text-lg font-semibold mb-1">
                  {plan.name}
                </h3>
                <p className="text-white text-left text-xs mb-6">{plan.desc}</p>

                <div className="flex items-end gap-1 mb-6">
                  <span className="text-white text-4xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-white text-sm mb-1">/month</span>
                </div>

                <Link
                  href="/sign-in"
                  target="blank"
                  className={clsx(
                    'w-full py-3 rounded-full block text-sm font-normal mb-8 transition',
                    plan.highlight
                      ? 'bg-white text-black hover:bg-black hover:text-white'
                      : 'border bg-[#141414] border-[#6300FF] text-white hover:bg-[#6300FF]'
                  )}
                >
                  Subscribe
                </Link>
                <ul className="space-y-3 text-sm text-white list-none">
                  {plan.features.map((feature, index) => (
                    <li key={feature} className="flex items-center gap-2">
                      <span className="flex h-3 w-3 p-1 items-center justify-center rounded-full bg-white text-black text-[8px]">
                        ✓
                      </span>

                      <span className="flex items-center gap-1">
                        {feature}
                        {index === 0 && (
                          <div className="group relative flex items-center">
                            <InfoCircledIcon className="w-4 h-4 text-white cursor-pointer" />

                            {/* Tooltip */}
                            <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs rounded-md bg-[#333] text-white text-xs px-2 py-1 opacity-0 invisible group-hover:visible group-hover:opacity-100 transition-opacity duration-200">
                              This is extra info about the first feature.
                            </span>
                          </div>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          {/* Enterprise */}
          <div className="max-w-6xl mx-auto mt-20">
            <div className="relative rounded-2xl border border-[#171064] bg-pricing-enterprise  backdrop-blur-xl p-10 flex flex-col lg:flex-row items-start lg:items-center justify-center  gap-12">
              {/* LEFT */}
              <div className="max-w-xs">
                <h3 className="text-white text-left text-2xl font-semibold mb-2">
                  Enterprise
                </h3>
                <p className="text-white text-left text-xs leading-normal">
                  Tailored solution for large organizations with <br />{' '}
                  customized pricing
                </p>
              </div>

              {/* FEATURES */}
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-20 gap-y-2 text-sm text-white/90">
                {[
                  'Custom Credits',
                  'Unlimited Jobs',
                  'Unlimited Users',
                  'Custom Video Retention',
                  'Whitelabel Branding',
                  'ATS Integration Options',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="flex h-3 w-3 p-1 items-center justify-center rounded-full bg-white text-black text-[8px]">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>

              {/* BUTTON */}
              <div className="shrink-0  ">
                <Link
                  href="/sign-up"
                  className="px-20 py-4 w-full mx-auto rounded-full bg-white text-black text-sm font-normal hover:scale-105 transition"
                >
                  Contact Sales
                </Link>
              </div>
            </div>

            {/* BOTTOM TEXT */}
            <p className="mt-8 text-center text-sm text-white/60 max-w-xl mx-auto">
              Get the power of a full recruitment team that would cost hundreds
              of thousands of dollars a year for a fraction of the cost.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
