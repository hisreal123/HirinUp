'use client';

import { useState } from 'react';
import { X, ChevronRight, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  {
    name: 'Necessary',
    description:
      'Necessary cookies are required to enable the basic features of this site, such as providing secure log-in or adjusting your consent preferences. These cookies do not store any personally identifiable data.',
  },
  {
    name: 'Functional',
    description:
      'Functional cookies help perfgitigorm certain functionalities like sharing the content of the website on social media platforms, collecting feedback, and other third-party features.',
  },
  {
    name: 'Analytical',
    description:
      'Analytical cookies are used to understand how visitors interact with the website. These cookies help provide information on metrics such as the number of visitors, bounce rate, traffic source, etc.',
  },
  {
    name: 'Performance',
    description:
      'Performance cookies are used to understand and analyse the key performance indexes of the website which helps in delivering a better user experience for the visitors.',
  },
  {
    name: 'Advertisement',
    description:
      'Advertisement cookies are used to provide visitors with customised advertisements based on the pages you visited previously and to analyse the effectiveness of the ad campaigns.',
  },
];

export function ConsentButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  function toggleExpand(name: string) {
    setExpanded((prev) => (prev === name ? null : name));
  }

  return (
    <>
      <motion.div
        className="fixed bottom-4 left-4 z-50 group cursor-pointer"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
      >
        <Image
          src="/consent-preference.png"
          alt="Consent Preference"
          width={32}
          height={32}
        />
        <span className="absolute left-10 bottom-1 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Consent Preference
        </span>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="relative bg-white rounded-2xl w-[50%] mx-auto max-h-[85vh] flex flex-col shadow-xl"
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-5 border-b rounded-t-2xl overflow-hidden">
                <h2
                  className="text-lg font-bold px-4"
                  style={{ color: '#212121' }}
                >
                  Customise Consent Preferences
                </h2>
                <motion.button
                  className="text-gray-400 hover:text-gray-600"
                  whileHover={{ rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                <div className="flex flex-col gap-2 px-4">
                  <p className="text-sm text-gray-600 mb-4">
                    We use cookies to help you navigate efficiently and perform
                    certain functions. You will find detailed information about
                    all cookies under each consent category below.
                  </p>
                  <p className="text-sm text-gray-600 mb-4">
                    The cookies that are categorised as &quot;Necessary&quot;
                    are stored on your browser as they are essential for
                    enabling the basic functionalities of the site.
                    <span
                      className="text-blue-500 cursor-pointer hover:underline ml-1"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? 'see less' : 'see more'}
                    </span>
                  </p>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.p
                        className="text-sm text-gray-600 mb-4"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        We use cookies to help you navigate efficiently and
                        perform certain functions. You will find detailed
                        information about all cookies under each consent
                        category below.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {CATEGORIES.map((cat, index) => (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <button
                      type="button"
                      className="w-full flex items-center gap-2 text-left p-3 font-medium border rounded-lg hover:bg-gray-50 transition-colors"
                      style={{ color: '#212121' }}
                      onClick={() => toggleExpand(cat.name)}
                    >
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-2">
                          <motion.div
                            animate={{ rotate: expanded === cat.name ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="h-4 w-4 shrink-0" />
                          </motion.div>
                          <span className="text-md">{cat.name}</span>
                        </div>
                        <span className="text-sm text-gray-600 pl-6">
                          {cat.description}
                        </span>

                        <AnimatePresence>
                          {expanded === cat.name && (
                            <motion.div
                              className="text-xs text-gray-500 bg-gray-200 rounded px-3 py-2 mt-1 w-full ml-5"
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              No cookies to display.
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-3 p-5 border-t">
                <motion.button
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-black py-3 h-fit rounded-sm hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                >
                  Reject All
                </motion.button>
                <motion.button
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-black py-3 h-fit rounded-sm hover:bg-gray-50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                >
                  Save My Preferences
                </motion.button>
                <motion.button
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary py-3 h-fit rounded-sm hover:opacity-90 transition-opacity"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsOpen(false)}
                >
                  Accept All
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
