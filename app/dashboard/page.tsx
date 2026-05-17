"use client";

import { useStreams } from "@/hooks/use-streams";
import {
  formatTokenAmount,
  calculateClaimable,
  calculateLinearUnlocked,
  formatPercentage,
  formatAddress,
} from "@/lib/utils";
import { motion } from "motion/react";
import {
  ArrowUpRight,
  Layers,
  Clock,
  Target,
  ChevronRight,
  Wallet,
} from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { streams } = useStreams();

  const activeStreams = streams.filter((s) => !s.isCancelled);
  const totalClaimed = streams.reduce((sum, s) => sum + s.claimedAmount, BigInt(0));
  const pendingMilestones = activeStreams.filter((s) => !s.milestoneAchieved).length;
  const totalClaimable = activeStreams.reduce(
    (sum, s) => sum + calculateClaimable(s),
    BigInt(0)
  );

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">Overview</h1>
        <p className="font-mono text-xs text-on-surface-variant mt-2 uppercase tracking-widest">
          Your hybrid distribution streams
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={<Layers className="w-5 h-5" />}
          label="Active Streams"
          value={activeStreams.length.toString()}
        />
        <StatCard
          icon={<Wallet className="w-5 h-5" />}
          label="Total Claimed"
          value={formatTokenAmount(totalClaimed)}
        />
        <StatCard
          icon={<ArrowUpRight className="w-5 h-5" />}
          label="Claimable Now"
          value={formatTokenAmount(totalClaimable)}
          highlight
        />
        <StatCard
          icon={<Target className="w-5 h-5" />}
          label="Pending Milestones"
          value={pendingMilestones.toString()}
        />
      </div>

      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline text-xl font-bold tracking-tight">Your Streams</h2>
        <Link
          href="/dashboard/create"
          className="bg-mint text-black font-mono text-xs font-bold px-4 py-2 rounded-sm hover:brightness-110 active:scale-95 transition-all uppercase flex items-center gap-2"
        >
          New Stream
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeStreams.map((stream) => {
          const linearUnlocked = calculateLinearUnlocked(
            stream.startTime,
            stream.endTime,
            stream.baseAmount
          );
          const totalUnlocked = linearUnlocked + (stream.milestoneAchieved ? stream.milestoneAmount : BigInt(0));
          const claimable = calculateClaimable(stream);
          const linearPct = formatPercentage(linearUnlocked, stream.baseAmount);
          const milestonePct = stream.milestoneAchieved ? 100 : 0;
          const totalPct = formatPercentage(totalUnlocked, stream.baseAmount + stream.milestoneAmount);

          return (
            <motion.div
              key={stream.id}
              whileHover={{ y: -2 }}
              className="glass-plate rounded-lg p-6"
            >
              <Link href={`/dashboard/${stream.id}`} className="block">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-headline text-lg font-bold text-on-surface">
                        {stream.tokenSymbol}
                      </span>
                      <span className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest">
                        {stream.id}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-on-surface-variant/70">
                      To: {formatAddress(stream.recipient)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-xs text-mint font-bold">
                      {formatTokenAmount(claimable)} claimable
                    </p>
                    <p className="font-mono text-[10px] text-on-surface-variant/50 mt-1">
                      {totalPct.toFixed(1)}% unlocked
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Linear Base
                      </span>
                      <span className="font-mono text-[10px] text-mint font-bold">
                        {linearPct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-linear-to-r from-mint to-solana-green transition-all duration-500"
                        style={{ width: `${linearPct}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Milestone Bonus
                      </span>
                      <span className="font-mono text-[10px] text-mint font-bold">
                        {milestonePct}%
                      </span>
                    </div>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${
                          stream.milestoneAchieved
                            ? "bg-mint shadow-[0_0_10px_rgba(47,243,200,0.5)]"
                            : "bg-white/10"
                        }`}
                        style={{ width: `${milestonePct}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`glass-plate rounded-lg p-6 ${
        highlight ? "border-mint/20 bg-mint/[0.02]" : ""
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-mint">{icon}</span>
        <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
          {label}
        </span>
      </div>
      <p
        className={`font-headline text-2xl font-bold tracking-tight ${
          highlight ? "text-mint" : "text-on-surface"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
