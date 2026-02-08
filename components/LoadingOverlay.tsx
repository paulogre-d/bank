"use client";

import Image from "next/image";
import { motion } from "framer-motion";

/**
 * Full-screen loading overlay with animated bank logo.
 * Use during auth hydration or any app-level loading state.
 */
export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/30 backdrop-blur-sm">
      <div className="flex flex-col items-center justify-center gap-8">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.85, 1, 0.85],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        >
          <Image
            src="/Container.svg"
            alt="Vertex Premium"
            width={80}
            height={80}
            className="h-16 w-16 sm:h-20 sm:w-20"
            priority
          />
        </motion.div>
        <motion.div
          className="h-1 w-28 overflow-hidden rounded-full bg-[#E2E8F0]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <motion.div
            className="h-full w-1/3 rounded-full bg-[#155DFC]"
            animate={{ x: ["0%", "200%"] }}
            transition={{
              duration: 1.4,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
}
