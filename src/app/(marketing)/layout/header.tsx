'use client';

import { useState } from 'react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import Link from 'next/link';
import Image from 'next/image';
import NavDropdown from '@/components/ui/NavDropdown';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 pt-4">
      <nav className="w-[88%] max-w-6xl mx-auto rounded-full bg-[#6300FF24] border border-gray-300/25 px-6 py-4 flex items-center justify-between backdrop-blur">
        {/* Logo */}
        <div className="flex items-center gap-2 text-xl font-semibold">
          <Link href="/home" className="text-white">
            <Image src="/logo.webp" alt="FoloUp Logo" width={113} height={47} />
          </Link>
        </div>

        {/* Desktop nav */}
        <div className="flex items-center gap-6">
          <ul className="hidden md:flex items-center list-none gap-6 text-sm text-white">
            <NavDropdown
              label="Product"
              items={[
                {
                  title: 'Job Tryouts',
                  highlight: true,
                  href: '/job-tryouts',
                },
                {
                  title: 'AI Candidate Screening',
                  href: '/ai-candidate-screening',
                },
              ]}
            />

            <li className="cursor-pointer ">
              <Link href="/pricing">Pricing</Link>
            </li>

            <li>
              <SignInButton mode="modal">
                <button className="cursor-pointer ">Sign In</button>
              </SignInButton>
            </li>
          </ul>

          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/book-a-demo"
              className="rounded-full bg-purple-600/10 border border-white px-3 py-3 text-xs hover:bg-white hover:text-purple-600 hover:border-purple-600"
            >
              Book a Demo
            </Link>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-[#6300ff] px-3 py-3 text-xs font-medium hover:bg-white hover:text-purple-600">
                Sign up
              </button>
            </SignUpButton>
          </div>
        </div>
        {/* Mobile menu button */}
        <button
          className="md:hidden flex items-center text-gray-200"
          onClick={() => setIsMenuOpen(true)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </nav>

      {/* Mobile menu modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur z-50 flex flex-col items-center justify-center">
          <button
            className="absolute top-5 right-5 text-white text-3xl"
            onClick={() => setIsMenuOpen(false)}
          >
            &times;
          </button>

          <ul className="flex flex-col items-center gap-6 text-white text-lg">
            <NavDropdown
              setMenu={() => setIsMenuOpen(false)}
              label="Product"
              items={[
                {
                  title: 'Job Tryouts',
                  highlight: true,
                  href: '/job-tryouts',
                },
                {
                  title: 'AI Candidate Screening',
                  href: '/ai-candidate-screening',
                },
              ]}
            />

            <li
              className="cursor-pointer hover:underline"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </li>
            <li>
              <SignInButton mode="modal">
                <button
                  className="cursor-pointer hover:underline"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </button>
              </SignInButton>
            </li>
            <li>
              <button
                className="rounded-full border border-white/20 px-6 py-2 text-sm hover:bg-white/10"
                onClick={() => setIsMenuOpen(false)}
              >
                Book a Demo
              </button>
            </li>
            <li>
              <SignUpButton mode="modal">
                <button
                  className="rounded-full bg-purple-600 px-6 py-2 font-medium hover:bg-purple-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign up
                </button>
              </SignUpButton>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
