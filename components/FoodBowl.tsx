"use client";

import {
  motion,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useEffect, useState, useCallback } from "react";

interface RollingNumberProps {
  value: number;
}

function RollingNumber({ value }: RollingNumberProps) {
  const spring = useSpring(value, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });
  const displayValue = useTransform(spring, (current) =>
    Math.floor(current).toLocaleString(),
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{displayValue}</motion.span>;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  rotate: number;
}

interface FoodBowlProps {
  onAddFood: () => void;
  foodAmount: number;
}

export default function FoodBowl({ onAddFood, foodAmount }: FoodBowlProps) {
  const [particles, setParticles] = useState<Particle[]>([]);

  const handlePress = useCallback(() => {
    onAddFood();

    // Create a new particle
    const newParticle: Particle = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 120, // Random X spread
      y: -60 - Math.random() * 60, // Random Y upward
      rotate: (Math.random() - 0.5) * 60, // Random rotation
    };

    setParticles((prev) => [...prev, newParticle].slice(-10)); // Keep only last 10

    // Clean up particle after animation
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== newParticle.id));
    }, 800);
  }, [onAddFood]);

  return (
    <div className="relative flex flex-col items-center gap-4 md:gap-6">
      {/* Prominent Unit Display */}
      <div className="flex flex-col items-center bg-white/5 backdrop-blur-xl rounded-2xl px-6 py-3 md:px-8 md:py-4 border border-white/10 shadow-2xl">
        <div className="text-4xl md:text-6xl font-black text-transparent bg-clip-text bg-linear-to-b from-yellow-200 to-yellow-500 drop-shadow-sm font-mono tracking-tighter">
          <RollingNumber value={foodAmount} />
        </div>
        <div className="text-[8px] md:text-[10px] font-black text-yellow-400/60 tracking-[0.3em] uppercase mt-1">
          Kitty Kibbles
        </div>
      </div>

      {/* Clickable Bowl Container */}
      <div className="relative group">
        {/* Animated Hover Ring (Aura) */}
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-yellow-400/0 group-hover:border-yellow-400/20 transition-all duration-700"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0, 0.5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.5,
            ease: "easeInOut",
          }}
        />

        {/* Floating Particles Area */}
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ opacity: 1, y: 0, x: 0, scale: 0.8 }}
              animate={{
                opacity: 0,
                y: particle.y,
                x: particle.x,
                scale: 1.5,
                rotate: particle.rotate,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
            >
              <span className="text-4xl md:text-5xl font-black text-yellow-400 drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] select-none">
                +1
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Clickable Bowl */}
        <motion.button
          onClick={handlePress}
          className="relative cursor-pointer select-none touch-manipulation 
                     bg-linear-to-b from-amber-100 via-amber-200 to-amber-300
                     rounded-full p-8 md:p-10 border-4 border-amber-900 
                     shadow-[0_20px_50px_rgba(0,0,0,0.4),inset_0_-8px_12px_rgba(0,0,0,0.15),inset_0_8px_12px_rgba(255,255,255,0.9)]
                     hover:shadow-[0_30px_60px_rgba(251,191,36,0.3)]
                     active:shadow-[0_10px_20px_rgba(0,0,0,0.3)]
                     transition-shadow duration-300"
          whileTap={{ scale: 0.9, rotate: -3 }}
          whileHover={{ scale: 1.08 }}
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            y: { repeat: Infinity, duration: 2, ease: "easeInOut" },
            default: { type: "spring", stiffness: 500, damping: 15 },
          }}
        >
          <div className="text-6xl md:text-8xl drop-shadow-xl filter saturate-125">
            🥣
          </div>

          {/* Flash Effect on Hover/Tap */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 rounded-t-full pointer-events-none blur-sm" />
        </motion.button>
      </div>

      <div className="text-white/80 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-center max-w-xs drop-shadow-md">
        Tap to refill bowl
      </div>
    </div>
  );
}
