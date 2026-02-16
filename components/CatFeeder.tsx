"use client";

import { useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CatState } from "@/lib/types";

interface CatFeederProps {
  catState: CatState;
}

const MESSAGES = {
  HUNGRY: [
    "FEED ME...",
    "STOMACH GROWLING...",
    "IS IT DINNER TIME?",
    "I'M FAMISHED!",
    "SO HUNGRY...",
    "WHERE'S THE KIBBLE?",
    "MEOW? (FOOD?)",
  ],
  EATING: [
    "MUNCH MUNCH!",
    "NOM NOM NOM...",
    "SO TASTY!",
    "DE-LISH!",
    "YUMMY!",
    "CRUNCHY BITES!",
    "PURR-FECT MEAL!",
  ],
  REACTING: [
    "OH YES!",
    "FINALLY!",
    "FOOD IS COMING!",
    "BEST FEEDER EVER!",
    "THANK YOU!",
    "AWW YEAH!",
    "MEOWWW! (YES!)",
  ],
};

export default function CatFeeder({ catState }: CatFeederProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [message, setMessage] = useState("");

  // Randomize message on state change OR periodically every 5s
  useEffect(() => {
    const rotateMessage = () => {
      const pool = MESSAGES[catState];
      setMessage((prev) => {
        const others = pool.filter((m) => m !== prev);
        return others.length > 0
          ? others[Math.floor(Math.random() * others.length)]
          : pool[Math.floor(Math.random() * pool.length)];
      });
    };

    // Initial switch when state changes (async to avoid lint)
    setTimeout(rotateMessage, 0);

    // Set interval for periodic rotation
    const interval = setInterval(rotateMessage, 5000);

    return () => clearInterval(interval);
  }, [catState]);

  // Sync audio with cat state
  useEffect(() => {
    if (videoRef.current) {
      // Only unmute when eating or reacting
      videoRef.current.muted = catState === "HUNGRY";
    }
  }, [catState]);

  return (
    <div className="relative flex flex-col items-center gap-8 md:gap-12 w-full max-w-2xl px-4">
      <div className="relative w-full aspect-square max-w-md mx-auto group">
        {/* Video Container (Cat) */}
        <div className="w-full h-full rounded-3xl overflow-hidden border-8 border-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] bg-amber-50 relative">
          {/* Internal Thought Bubble */}
          <AnimatePresence mode="wait">
            <motion.div
              key={message}
              initial={{ opacity: 0, scale: 0.5, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: -10 }}
              className="absolute top-8 md:top-12 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            >
              <div className="relative bg-black/75 backdrop-blur-md text-white px-4 py-2 md:px-6 md:py-3 rounded-2xl md:rounded-3xl shadow-2xl border border-white/20 min-w-[120px] md:min-w-[160px] text-center">
                <span className="text-sm md:text-lg font-black tracking-tight whitespace-nowrap drop-shadow-md">
                  {message}
                </span>
                {/* Triangle Pointer */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-black/75 border-r border-b border-white/20 rotate-45" />
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div
            className="w-[200%] h-full flex"
            animate={{
              x: catState === "HUNGRY" ? "0%" : "-50%",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <video
              ref={videoRef}
              src="/cat-eat.mp4"
              autoPlay
              loop
              muted // Start muted to comply with browser autoplay policies
              playsInline
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* State Overlay Effect */}
          <AnimatePresence>
            {catState === "REACTING" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-yellow-400/10 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
