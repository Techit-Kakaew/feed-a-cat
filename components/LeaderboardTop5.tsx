"use client";

import { useState } from "react";
import Image from "next/image";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { motion } from "framer-motion";
import LeaderboardModal from "./LeaderboardModal";

export default function LeaderboardTop5() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: scores = [] } = useLeaderboard({ limit: 5 });

  return (
    <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-2">
          <span className="text-2xl">🏆</span> TOP FEEDERS
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest bg-blue-50 px-3 py-1.5 rounded-full transition-all hover:scale-105 active:scale-95"
        >
          View All
        </button>
      </div>

      <div className="space-y-3">
        {scores.map((country, index) => (
          <motion.div
            key={country.country_code}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-2.5 md:p-3 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100 group"
          >
            <div className="flex items-center gap-2 md:gap-3">
              <span
                className={`
                flex items-center justify-center w-6 h-6 md:w-7 md:h-7 rounded-full text-[9px] md:text-[10px] font-black
                ${
                  index === 0
                    ? "bg-yellow-400 text-yellow-900 shadow-sm"
                    : index === 1
                      ? "bg-gray-200 text-gray-700 shadow-sm"
                      : index === 2
                        ? "bg-amber-600 text-amber-100 shadow-sm"
                        : "bg-gray-100 text-gray-500"
                }
              `}
              >
                {index + 1}
              </span>
              <Image
                src={`https://flagcdn.com/w40/${country.country_code.toLowerCase()}.png`}
                alt={country.country_code}
                width={24}
                height={18}
                className="w-6 md:w-7 h-auto rounded shadow-sm group-hover:scale-110 transition-transform"
              />
              <span className="font-bold text-gray-800 text-xs md:text-sm truncate max-w-[80px] md:max-w-[120px]">
                {country.country_name}
              </span>
            </div>
            <span className="font-mono font-black text-base md:text-lg text-blue-600">
              {Number(country.score).toLocaleString()}
            </span>
          </motion.div>
        ))}

        {scores.length === 0 && (
          <div className="text-center text-gray-400 py-6 font-medium italic">
            Crunching numbers...
          </div>
        )}
      </div>

      {/* Full Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
