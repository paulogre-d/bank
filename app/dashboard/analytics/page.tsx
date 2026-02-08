"use client";

import { motion } from "framer-motion";

// --- Animation variants (matching Dashboard) ---
const stagger = {
  animate: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

const fadeUpTransition = { duration: 0.4, ease: [0.22, 1, 0.36, 1] };

export default function AnalyticsPage() {
  return (
    <motion.div
      className="space-y-6"
      initial="initial"
      animate="animate"
      variants={stagger}
    >
      <motion.h1
        className="text-2xl font-bold text-[#0F172B]"
        variants={fadeUp}
        transition={fadeUpTransition}
      >
        Analytics
      </motion.h1>
      <motion.p
        className="text-[#62748E]"
        variants={fadeUp}
        transition={fadeUpTransition}
      >
        Analytics dashboard coming soon.
      </motion.p>
    </motion.div>
  );
}
