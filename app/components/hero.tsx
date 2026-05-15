"use client";

import { motion } from "motion/react";
import { Shield, ChevronRight } from "lucide-react";
import { useState } from "react";

export default function Hero() {
  const [email, setEmail] = useState("");

  return (
    <section className="pt-40 pb-24 px-6 flex flex-col items-center text-center max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-mint/20 bg-mint/5 mb-8"
      >
        <span className="w-2 h-2 rounded-full bg-mint animate-pulse" />
        <span className="font-mono text-[10px] text-mint tracking-[0.2em] font-bold uppercase">
          Protocol Live for Early Builders
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="font-headline text-5xl md:text-7xl mb-6 max-w-4xl tracking-tighter glow-text leading-[1.1] font-bold"
      >
        End the vesting gamble with a{" "}
        <span className="mint-gradient-text">
          balance of steady cashflow.
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="font-sans text-lg md:text-xl text-on-surface-variant max-w-2xl mb-12"
      >
        Give builders survival cash while securing their long-term project
        upside. Nirvana automates trust through code-enforced financial
        alignment.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-xl flex flex-col md:flex-row gap-2 p-2 glass-plate rounded-lg group"
      >
        <input
          className="flex-grow bg-transparent border-none focus:ring-0 text-on-surface px-4 py-3 font-mono text-sm placeholder:text-on-surface-variant/40"
          placeholder="builder@protocol.eth"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="bg-solana-green text-black font-mono text-xs font-bold px-8 py-4 rounded-sm hover:brightness-110 active:scale-95 transition-all whitespace-nowrap shadow-[0_0_20px_rgba(20,241,149,0.2)] uppercase flex items-center justify-center gap-2">
          Claim automated balance
          <ChevronRight className="w-4 h-4" />
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 0.4 }}
        className="mt-6 flex items-center gap-2 text-on-surface-variant"
      >
        <Shield className="w-4 h-4" />
        <span className="font-mono text-[9px] tracking-[0.25em] font-bold uppercase">
          Encrypted & non-custodial entry
        </span>
      </motion.div>
    </section>
  );
}
