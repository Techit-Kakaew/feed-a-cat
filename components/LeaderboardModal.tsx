"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { motion, AnimatePresence } from "framer-motion";

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LeaderboardModal({
  isOpen,
  onClose,
}: LeaderboardModalProps) {
  const { data: scores = [], isLoading: loading } = useLeaderboard({
    all: true,
    enabled: isOpen,
  });

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-2xl"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-4 md:p-6 border-b flex items-center justify-between bg-linear-to-r from-blue-600 to-indigo-600">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2 md:gap-3">
                <span className="text-2xl md:text-3xl">🏆</span> Global
                Leaderboard
              </h2>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/10 rounded-full p-1.5 md:p-2 transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-5 h-5 md:w-6 md:h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-1 md:p-2 bg-gray-50">
              {loading ? (
                <div className="flex flex-col items-center justify-center p-12 md:p-20 gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-gray-500 text-sm md:font-medium animate-pulse text-center">
                    Calculating world hunger...
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5 md:space-y-1">
                  {scores.map((country, index) => (
                    <motion.div
                      key={country.country_code}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 1) }}
                      className="flex items-center justify-between p-3 md:p-4 rounded-xl hover:bg-white hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <span
                          className={`
                          flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full font-black text-[10px] md:text-sm
                          ${
                            index === 0
                              ? "bg-yellow-400 text-yellow-900 shadow-lg shadow-yellow-200"
                              : index === 1
                                ? "bg-gray-300 text-gray-800 shadow-lg shadow-gray-200"
                                : index === 2
                                  ? "bg-amber-600 text-amber-100 shadow-lg shadow-amber-200"
                                  : "bg-gray-100 text-gray-500"
                          }
                        `}
                        >
                          {index + 1}
                        </span>
                        <Image
                          src={`https://flagcdn.com/w80/${country.country_code.toLowerCase()}.png`}
                          alt={country.country_code}
                          width={32}
                          height={24}
                          className="w-8 md:w-10 h-auto rounded shadow-sm border border-gray-100 group-hover:scale-110 transition-transform"
                        />
                        <span className="font-bold text-gray-800 text-sm md:text-lg truncate max-w-[100px] md:max-w-none">
                          {country.country_name}
                        </span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-mono font-black text-lg md:text-2xl text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-indigo-600">
                          {Number(country.score).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}

                  {scores.length === 0 && (
                    <div className="text-center text-gray-400 py-12 italic">
                      No one has fed the cat yet... be the first!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50 text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest">
              Live updates
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
