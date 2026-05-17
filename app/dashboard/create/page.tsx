"use client";

import { useState } from "react";
import { useStreams } from "@/hooks/use-streams";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ChevronRight, Info } from "lucide-react";
import { useAuth } from "@/app/providers/privy-provider";

const COMMON_TOKENS = [
  { symbol: "SOL", mint: "So11111111111111111111111111111111111111112", decimals: 9 },
  { symbol: "USDC", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6 },
  { symbol: "BONK", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5 },
];

export default function CreateStreamPage() {
  const { handleCreateStream, loading } = useStreams();
  const { user } = useAuth();
  const router = useRouter();

  const [recipient, setRecipient] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("SOL");
  const [tokenMint, setTokenMint] = useState(COMMON_TOKENS[0].mint);
  const [baseAmount, setBaseAmount] = useState("");
  const [milestoneAmount, setMilestoneAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cliffDate, setCliffDate] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !baseAmount || !milestoneAmount || !startDate || !endDate || !cliffDate) return;

    await handleCreateStream({
      recipient,
      tokenMint,
      tokenSymbol,
      baseAmount: parseFloat(baseAmount),
      milestoneAmount: parseFloat(milestoneAmount),
      startTime: Math.floor(new Date(startDate).getTime() / 1000),
      endTime: Math.floor(new Date(endDate).getTime() / 1000),
      cliffTime: Math.floor(new Date(cliffDate).getTime() / 1000),
    });

    router.push("/dashboard");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Create Stream</h1>
        <p className="font-mono text-xs text-on-surface-variant mt-2 uppercase tracking-widest">
          Initialize a new hybrid vesting stream
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-plate rounded-lg p-8 max-w-2xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="md:col-span-2">
              <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK"
                className="w-full bg-white/3 border border-white/10 rounded-sm px-4 py-3 font-mono text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-mint/40 transition-colors"
                required
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">
                Token
              </label>
              <select
                value={tokenSymbol}
                onChange={(e) => {
                  setTokenSymbol(e.target.value);
                  const t = COMMON_TOKENS.find((x) => x.symbol === e.target.value);
                  if (t) setTokenMint(t.mint);
                }}
                className="w-full bg-white/3 border border-white/10 rounded-sm px-4 py-3 font-mono text-sm text-on-surface focus:outline-none focus:border-mint/40 transition-colors appearance-none cursor-pointer"
              >
                {COMMON_TOKENS.map((t) => (
                  <option key={t.symbol} value={t.symbol} className="bg-surface text-on-surface">
                    {t.symbol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">
                Token Mint
              </label>
              <input
                type="text"
                value={tokenMint}
                onChange={(e) => setTokenMint(e.target.value)}
                className="w-full bg-white/3 border border-white/10 rounded-sm px-4 py-3 font-mono text-xs text-on-surface-variant/70 focus:outline-none focus:border-mint/40 transition-colors"
                required
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">
                Base Amount (Linear)
              </label>
              <input
                type="number"
                value={baseAmount}
                onChange={(e) => setBaseAmount(e.target.value)}
                placeholder="500000"
                step="any"
                min="0"
                className="w-full bg-white/3 border border-white/10 rounded-sm px-4 py-3 font-mono text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-mint/40 transition-colors"
                required
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">
                Milestone Amount (Bonus)
              </label>
              <input
                type="number"
                value={milestoneAmount}
                onChange={(e) => setMilestoneAmount(e.target.value)}
                placeholder="200000"
                step="any"
                min="0"
                className="w-full bg-white/3 border border-white/10 rounded-sm px-4 py-3 font-mono text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-mint/40 transition-colors"
                required
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-white/3 border border-white/10 rounded-sm px-4 py-3 font-mono text-sm text-on-surface focus:outline-none focus:border-mint/40 transition-colors"
                required
              />
            </div>

            <div>
              <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-white/3 border border-white/10 rounded-sm px-4 py-3 font-mono text-sm text-on-surface focus:outline-none focus:border-mint/40 transition-colors"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">
                Cliff Date
              </label>
              <input
                type="date"
                value={cliffDate}
                onChange={(e) => setCliffDate(e.target.value)}
                className="w-full bg-white/3 border border-white/10 rounded-sm px-4 py-3 font-mono text-sm text-on-surface focus:outline-none focus:border-mint/40 transition-colors"
                required
              />
              <p className="font-mono text-[10px] text-on-surface-variant/50 mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" />
                Tokens cannot be claimed before the cliff date
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-mint text-black font-mono text-sm font-bold px-8 py-4 rounded-sm hover:brightness-110 active:scale-95 transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(47,243,200,0.2)]"
          >
            {loading ? "Creating..." : "Create Stream"}
            {!loading && <ChevronRight className="w-4 h-4" />}
          </button>
        </motion.div>
      </form>
    </div>
  );
}
