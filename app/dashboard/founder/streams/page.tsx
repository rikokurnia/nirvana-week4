"use client";

import { useStreams } from "@/hooks/use-streams";
import { formatTokenAmount, calculateClaimable, formatAddress, formatDate } from "@/lib/utils";
import { motion } from "motion/react";
import { Ban, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function FounderStreamsPage() {
  const { streams, handleCancel } = useStreams();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-headline text-3xl font-bold tracking-tight">My Streams</h1>
        <p className="font-mono text-xs text-on-surface-variant mt-2 uppercase tracking-widest">
          Manage all your created streams
        </p>
      </div>

      {streams.length === 0 ? (
        <div className="glass-plate rounded-lg p-12 text-center">
          <p className="font-mono text-sm text-on-surface-variant">No streams created yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {streams.map((stream) => {
            const claimable = calculateClaimable(stream);
            const totalAmount = stream.baseAmount + stream.milestoneAmount + stream.cliffAmount;
            return (
              <motion.div key={stream.id} whileHover={{ y: -2 }} className="glass-plate rounded-lg p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-headline text-lg font-bold text-on-surface">
                        {formatTokenAmount(totalAmount)} {stream.tokenSymbol}
                      </span>
                      <span
                        className={`font-mono text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-widest ${
                          stream.isCancelled
                            ? "bg-red-400/10 text-red-400"
                            : "bg-mint/10 text-mint"
                        }`}
                      >
                        {stream.isCancelled ? "Cancelled" : "Active"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[10px] text-on-surface-variant/50 uppercase tracking-widest">
                      <span>{formatTokenAmount(stream.baseAmount)} linear</span>
                      <span className="text-on-surface-variant/20">·</span>
                      <span>{formatTokenAmount(stream.milestoneAmount)} milestone</span>
                      <span className="text-on-surface-variant/20">·</span>
                      <span>{formatTokenAmount(stream.cliffAmount)} cliff</span>
                    </div>
                    <p className="font-mono text-[10px] text-on-surface-variant/40 mt-1">
                      To: {formatAddress(stream.recipient)} — {stream.id}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono text-xs text-mint font-bold">
                      {formatTokenAmount(claimable)} claimable
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 text-[10px] font-mono text-on-surface-variant/50 uppercase tracking-widest mb-4">
                  <span>{formatDate(stream.startTime)} → {formatDate(stream.endTime)}</span>
                  <span>Cliff: {formatDate(stream.cliffTime)}</span>
                  <span>Milestone: {stream.milestoneAchieved ? "Achieved" : "Pending"}</span>
                </div>

                <div className="flex gap-3">
                  {!stream.isCancelled && (
                    <button
                      onClick={() => handleCancel(stream.id)}
                      className="flex items-center gap-1 border border-red-400/30 text-red-400 font-mono text-xs font-bold px-4 py-2 rounded-sm hover:bg-red-400/10 transition-all uppercase"
                    >
                      <Ban className="w-3 h-3" />
                      Cancel Stream
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
