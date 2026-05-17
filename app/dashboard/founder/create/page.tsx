"use client";

import { useState, useMemo } from "react";
import { useStreams } from "@/hooks/use-streams";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ChevronRight,
  Info,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  getPresets,
  calculateStreamSplit,
  type StreamPreset,
} from "@/lib/stream-calculator";

const COMMON_TOKENS = [
  { symbol: "SOL", mint: "So11111111111111111111111111111111111111112" },
  { symbol: "USDC", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" },
  { symbol: "BONK", mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263" },
];

export default function CreateStreamPage() {
  const { handleCreateStream, loading } = useStreams();
  const router = useRouter();
  const presets = getPresets();

  const [recipient, setRecipient] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("SOL");
  const [totalAmount, setTotalAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<StreamPreset>(presets[0]);

  const split = useMemo(() => {
    if (!totalAmount || !startDate || !endDate) return null;
    const start = Math.floor(new Date(startDate).getTime() / 1000);
    const end = Math.floor(new Date(endDate).getTime() / 1000);
    if (start >= end) return null;
    return calculateStreamSplit(parseFloat(totalAmount), start, end, selectedPreset);
  }, [totalAmount, startDate, endDate, selectedPreset]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !totalAmount || !startDate || !endDate || !split) return;

    const start = Math.floor(new Date(startDate).getTime() / 1000);
    const end = Math.floor(new Date(endDate).getTime() / 1000);

    const tokenMint = COMMON_TOKENS.find((t) => t.symbol === tokenSymbol)?.mint || COMMON_TOKENS[0].mint;

    await handleCreateStream({
      recipient,
      tokenMint,
      tokenSymbol,
      baseAmount: split.linearAmount + split.cliffAmount,
      milestoneAmount: split.milestoneAmount,
      startTime: start,
      endTime: end,
      cliffTime: split.cliffTime,
    });

    router.push("/dashboard/founder");
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Create Stream</h1>
        <p className="font-mono text-xs text-on-surface-variant mt-2 uppercase tracking-widest">
          Auto-split hybrid vesting
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 glass-plate rounded-lg p-8"
          >
            <h3 className="font-headline text-lg font-bold tracking-tight mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-mint" />
              Stream Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                  onChange={(e) => setTokenSymbol(e.target.value)}
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
                  Total Amount
                </label>
                <input
                  type="number"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  placeholder="100000"
                  step="any"
                  min="0"
                  className="w-full bg-white/3 border border-white/10 rounded-sm px-4 py-3 font-mono text-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-mint/40 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest block mb-2">
                  Preset
                </label>
                <select
                  value={selectedPreset.name}
                  onChange={(e) => {
                    const p = presets.find((x) => x.name === e.target.value);
                    if (p) setSelectedPreset(p);
                  }}
                  className="w-full bg-white/3 border border-white/10 rounded-sm px-4 py-3 font-mono text-sm text-on-surface focus:outline-none focus:border-mint/40 transition-colors appearance-none cursor-pointer"
                >
                  {presets.map((p) => (
                    <option key={p.name} value={p.name} className="bg-surface text-on-surface">
                      {p.label} ({p.linearPercent}/{p.milestonePercent}/{p.cliffPercent})
                    </option>
                  ))}
                </select>
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
            </div>

            {split && (
              <div className="flex items-center gap-3 mb-4 p-4 bg-mint/5 rounded-sm border border-mint/10">
                <Info className="w-4 h-4 text-mint shrink-0" />
                <p className="font-mono text-[10px] text-mint uppercase tracking-widest leading-relaxed">
                  Auto-split: {split.linearAmount.toLocaleString()} linear + {split.milestoneAmount.toLocaleString()} milestone + {split.cliffAmount.toLocaleString()} cliff buffer
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-mint text-black font-mono text-sm font-bold px-8 py-4 rounded-sm hover:brightness-110 active:scale-95 transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(47,243,200,0.2)]"
            >
              {loading ? "Creating..." : "Create Stream"}
              {!loading && <ChevronRight className="w-4 h-4" />}
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-plate rounded-lg p-6 h-fit"
          >
            <h3 className="font-headline text-lg font-bold tracking-tight mb-4 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-mint" />
              Split Preview
            </h3>

            {split ? (
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Linear</span>
                    <span className="font-mono text-[10px] text-mint font-bold">{selectedPreset.linearPercent}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-mint to-solana-green" style={{ width: `${selectedPreset.linearPercent}%` }} />
                  </div>
                  <p className="font-mono text-[10px] text-on-surface-variant/50 mt-1">{split.linearAmount.toLocaleString()} {tokenSymbol}</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Milestone</span>
                    <span className="font-mono text-[10px] text-mint font-bold">{selectedPreset.milestonePercent}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-mint" style={{ width: `${selectedPreset.milestonePercent}%` }} />
                  </div>
                  <p className="font-mono text-[10px] text-on-surface-variant/50 mt-1">{split.milestoneAmount.toLocaleString()} {tokenSymbol}</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Cliff Buffer</span>
                    <span className="font-mono text-[10px] text-mint font-bold">{selectedPreset.cliffPercent}%</span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-solana-green/80" style={{ width: `${selectedPreset.cliffPercent}%` }} />
                  </div>
                  <p className="font-mono text-[10px] text-on-surface-variant/50 mt-1">{split.cliffAmount.toLocaleString()} {tokenSymbol}</p>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between">
                    <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Cliff Unlocks</span>
                    <span className="font-mono text-[10px] text-mint font-bold">
                      {new Date(split.cliffTime * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="font-mono text-xs text-on-surface-variant/50 leading-relaxed">
                Enter total amount and dates to see the auto-calculated split.
              </p>
            )}
          </motion.div>
        </div>
      </form>
    </div>
  );
}
