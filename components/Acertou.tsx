"use client";

import { motion } from "motion/react";

/** Lacre de cera "ACERTOU!" que bate na tela quando a resposta está certa. */
export default function Acertou() {
  return (
    <motion.div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
    >
      <motion.div
        className="absolute inset-0 bg-[#fff3d0]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.55, 0] }}
        transition={{ duration: 0.6, times: [0, 0.15, 1], delay: 0.18 }}
      />
      <motion.div
        initial={{ scale: 3.2, rotate: -40, opacity: 0 }}
        animate={{ scale: 1, rotate: -8, opacity: 1 }}
        exit={{ scale: 0.6, opacity: 0, rotate: 10 }}
        transition={{ type: "spring", stiffness: 320, damping: 14, mass: 0.9 }}
        className="relative"
      >
        <svg viewBox="0 0 200 200" className="h-56 w-56 drop-shadow-[0_10px_18px_rgba(60,10,0,0.45)]">
          <path
            d="M100 8c13 0 18 10 30 13s24-3 32 7 2 22 8 33 18 16 18 39-12 26-18 37-0 23-8 32-21 4-32 8-17 13-30 13-18-10-30-13-24 3-32-7-2-22-8-33-18-16-18-39 12-26 18-37 0-23 8-32 21-4 32-8 17-13 30-13z"
            fill="#9b2617"
          />
          <circle cx="100" cy="100" r="64" fill="none" stroke="#6e150a" strokeWidth="4" />
          <circle cx="100" cy="100" r="56" fill="none" stroke="#c4472f" strokeWidth="1.5" strokeDasharray="3 5" />
          <text
            x="100"
            y="112"
            textAnchor="middle"
            fontSize="36"
            fill="#f6dcc0"
            style={{ fontFamily: "var(--font-pirata-one)" }}
          >
            Acertou!
          </text>
        </svg>
      </motion.div>
    </motion.div>
  );
}
