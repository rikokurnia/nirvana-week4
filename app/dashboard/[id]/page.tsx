"use client";

import { useStreams } from "@/hooks/use-streams";
import { useParams, useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  ChevronRight,
  ArrowLeft,
  Clock,
  Target,
  Wallet,
  Shield,
  Ban,
  User,
  Calendar,
} from "lucide-react";
import {
  formatTokenAmount,
  calculateClaimable,
  calculateLinearUnlocked,
  calculateTotalUnlocked,
  formatPercentage,
  formatAddress,
  formatDate,
} from "@/lib/utils";
import { useState } from "react";

export default function StreamDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { getStream, getClaimable, handleWithdraw, handleCancel, loading } = useStreams();
  const [showConfirmCancel, setShowConfirmCancel] = useState(false);

  const stream = getStream(id);

  if (!stream) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="font-mono text-sm text-on-surface-variant">Stream not found</p>
        <button
          onClick={() => router.push("/dashboard")}
          className="mt-4 text-mint font-mono text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Dashboard
        </button>
      </div>
    );
  }

  const linearUnlocked = calculateLinearUnlocked(
    stream.startTime,
    stream.endTime,
    stream.baseAmount
  );
  const totalUnlocked = calculateTotalUnlocked(stream);
  const claimable = calculateClaimable(stream);
  const linearPct = formatPercentage(linearUnlocked, stream.baseAmount);
  const milestonePct = stream.milestoneAchieved ? 100 : 0;
  const totalPct = formatPercentage(totalUnlocked, stream.baseAmount + stream.milestoneAmount);
  const claimedPct = formatPercentage(stream.claimedAmount, stream.baseAmount + stream.milestoneAmount);

  return (
    <div>
      <button
        onClick={() => router.push("/dashboard")}
        className="flex items-center gap-2 font-mono text-xs text-on-surface-variant hover:text-mint transition-colors mb-6 uppercase tracking-widest"
      >
        <ArrowLeft className="w-3 h-3" />
        Back
      </button>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="font-headline text-3xl font-bold tracking-tight">
            {stream.tokenSymbol} Stream
          </h1>
          <span className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest">
            {stream.id}
          </span>
        </div>
        <p className="font-mono text-xs text-on-surface-variant mt-1">
          {stream.isCancelled ? (
            <span className="text-red-400">Cancelled</span>
          ) : (
            <span className="text-mint">Active</span>
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-plate rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Wallet className="w-4 h-4 text-mint" />
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
              Claimable Now
            </span>
          </div>
          <p className="font-headline text-2xl font-bold text-mint tracking-tight">
            {formatTokenAmount(claimable)}
          </p>
          <p className="font-mono text-[10px] text-on-surface-variant/50 mt-1">
            {stream.tokenSymbol}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-plate rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-mint" />
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
              Total Claimed
            </span>
          </div>
          <p className="font-headline text-2xl font-bold text-on-surface tracking-tight">
            {formatTokenAmount(stream.claimedAmount)}
          </p>
          <p className="font-mono text-[10px] text-on-surface-variant/50 mt-1">
            {claimedPct.toFixed(1)}% of total
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-plate rounded-lg p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-mint" />
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
              Total Allocation
            </span>
          </div>
          <p className="font-headline text-2xl font-bold text-on-surface tracking-tight">
            {formatTokenAmount(stream.baseAmount + stream.milestoneAmount)}
          </p>
          <p className="font-mono text-[10px] text-on-surface-variant/50 mt-1">
            Base + Milestone
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-plate rounded-lg p-8 mb-8"
      >
        <h3 className="font-headline text-lg font-bold tracking-tight mb-6">
          Dual-Layer Progress
        </h3>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Linear Base Layer
              </span>
              <span className="font-mono text-xs text-mint font-bold">
                {linearPct.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${linearPct}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-full bg-linear-to-r from-mint to-solana-green shadow-[0_0_10px_rgba(47,243,200,0.3)]"
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono text-[10px] text-on-surface-variant/50">
                {formatTokenAmount(stream.baseAmount)} total
              </span>
              <span className="font-mono text-[10px] text-on-surface-variant/50">
                {formatTokenAmount(linearUnlocked)} unlocked
              </span>
            </div>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest flex items-center gap-2">
                <Target className="w-4 h-4" />
                Milestone Bonus Layer
              </span>
              <span className="font-mono text-xs text-mint font-bold">
                {stream.milestoneAchieved ? "ACHIEVED" : "LOCKED"}
              </span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${milestonePct}%` }}
                transition={{ duration: 1, delay: 0.6 }}
                className={`h-full ${
                  stream.milestoneAchieved
                    ? "bg-mint shadow-[0_0_10px_rgba(47,243,200,0.5)]"
                    : "bg-white/10"
                }`}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="font-mono text-[10px] text-on-surface-variant/50">
                {formatTokenAmount(stream.milestoneAmount)} bonus
              </span>
              <span className="font-mono text-[10px] text-on-surface-variant/50">
                {stream.milestoneAchieved ? "Unlocked by Oracle" : "Awaiting KPI verification"}
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">
                Total Unlocked
              </span>
              <span className="font-mono text-xs text-mint font-bold">
                {totalPct.toFixed(1)}%
              </span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${totalPct}%` }}
                transition={{ duration: 1, delay: 0.7 }}
                className="h-full bg-linear-to-r from-mint/50 to-solana-green/50"
              />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-plate rounded-lg p-8 mb-8"
      >
        <h3 className="font-headline text-lg font-bold tracking-tight mb-6">
          Stream Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailRow icon={<User className="w-4 h-4" />} label="Authority" value={formatAddress(stream.authority)} />
          <DetailRow icon={<User className="w-4 h-4" />} label="Recipient" value={formatAddress(stream.recipient)} />
          <DetailRow icon={<Calendar className="w-4 h-4" />} label="Start" value={formatDate(stream.startTime)} />
          <DetailRow icon={<Calendar className="w-4 h-4" />} label="End" value={formatDate(stream.endTime)} />
          <DetailRow icon={<Clock className="w-4 h-4" />} label="Cliff" value={formatDate(stream.cliffTime)} />
          <DetailRow icon={<Shield className="w-4 h-4" />} label="Token Mint" value={formatAddress(stream.tokenMint)} />
        </div>
      </motion.div>

      <div className="flex gap-4">
        <button
          onClick={() => handleWithdraw(stream.id)}
          disabled={loading || claimable === BigInt(0) || stream.isCancelled}
          className="flex-1 bg-mint text-black font-mono text-sm font-bold px-8 py-4 rounded-sm hover:brightness-110 active:scale-95 transition-all uppercase flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(47,243,200,0.2)]"
        >
          {loading ? "Processing..." : "Withdraw"}
          {!loading && <ChevronRight className="w-4 h-4" />}
        </button>

        {!stream.isCancelled && (
          <>
            {!showConfirmCancel ? (
              <button
                onClick={() => setShowConfirmCancel(true)}
                className="border border-red-400/30 text-red-400 font-mono text-sm font-bold px-8 py-4 rounded-sm hover:bg-red-400/10 transition-all uppercase flex items-center gap-2"
              >
                <Ban className="w-4 h-4" />
                Cancel
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => handleCancel(stream.id)}
                  disabled={loading}
                  className="bg-red-500 text-white font-mono text-sm font-bold px-8 py-4 rounded-sm hover:bg-red-600 transition-all uppercase disabled:opacity-50"
                >
                  Confirm Cancel
                </button>
                <button
                  onClick={() => setShowConfirmCancel(false)}
                  className="border border-white/10 text-on-surface-variant font-mono text-sm font-bold px-8 py-4 rounded-sm hover:bg-white/5 transition-all uppercase"
                >
                  No, Keep
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-mint">{icon}</span>
      <div>
        <p className="font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest">
          {label}
        </p>
        <p className="font-mono text-xs text-on-surface mt-0.5">{value}</p>
      </div>
    </div>
  );
}
