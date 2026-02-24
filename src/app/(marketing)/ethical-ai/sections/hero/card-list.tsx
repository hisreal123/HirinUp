'use client';

import { Users2, Sparkles, Gavel } from 'lucide-react';
import { motion } from 'framer-motion';
import CardItem from './card-item';

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    x: 80, // start from right
  },
  show: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
};

export default function CardList() {
  return (
    <motion.div
      className="relative max-w-6xl mt-20 mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <motion.div variants={cardVariants}>
          <CardItem
            icon={<Users2 className="w-16 h-16" />}
            title="How Recruitment Has Transformed"
            desc="Discover the dramatic evolution of hiring practices over the past two decades, from manual processes to data-driven strategies."
          />
        </motion.div>

        {/* Card 2 */}
        <motion.div variants={cardVariants}>
          <CardItem
            icon={<Sparkles className="w-16 h-16" />}
            title="How to Use AI in Hiring Ethically"
            desc="Learn how to leverage AI tools responsibly, addressing concerns about bias and ensuring fair, human-centric recruitment."
            highlight
          />
        </motion.div>

        {/* Card 3 */}
        <motion.div variants={cardVariants}>
          <CardItem
            icon={<Gavel className="w-16 h-16" />}
            title="How to Use AI in Hiring Legally"
            desc="Understand the critical legal implications of AI in hiring and how to navigate regulations to ensure compliance and avoid pitfalls."
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
