"use client";

import { useState, useCallback } from "react";
import type { DistributionState } from "@/lib/types";
import { MOCK_STREAMS } from "@/lib/mock-data";
import { calculateClaimable } from "@/lib/utils";

export function useStreams() {
  const [streams, setStreams] = useState<DistributionState[]>(MOCK_STREAMS);
  const [loading, setLoading] = useState(false);

  const getStream = useCallback(
    (id: string) => streams.find((s) => s.id === id),
    [streams]
  );

  const getClaimable = useCallback((stream: DistributionState) => {
    return calculateClaimable(stream);
  }, []);

  const handleWithdraw = useCallback(async (streamId: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setStreams((prev) =>
      prev.map((s) => {
        if (s.id !== streamId) return s;
        const claimable = calculateClaimable(s);
        return { ...s, claimedAmount: s.claimedAmount + claimable };
      })
    );
    setLoading(false);
  }, []);

  const handleCancel = useCallback(async (streamId: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setStreams((prev) =>
      prev.map((s) => (s.id === streamId ? { ...s, isCancelled: true } : s))
    );
    setLoading(false);
  }, []);

  const handleCreateStream = useCallback(async (params: {
    recipient: string;
    tokenMint: string;
    tokenSymbol: string;
    baseAmount: number;
    milestoneAmount: number;
    startTime: number;
    endTime: number;
    cliffTime: number;
  }) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const decimals = 9;
    const newStream: DistributionState = {
      id: `stream_${Date.now()}`,
      authority: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
      recipient: params.recipient,
      tokenMint: params.tokenMint,
      tokenSymbol: params.tokenSymbol,
      baseAmount: BigInt(Math.floor(params.baseAmount * 10 ** decimals)),
      milestoneAmount: BigInt(Math.floor(params.milestoneAmount * 10 ** decimals)),
      claimedAmount: BigInt(0),
      startTime: params.startTime,
      endTime: params.endTime,
      cliffTime: params.cliffTime,
      milestoneAchieved: false,
      isCancelled: false,
    };
    setStreams((prev) => [...prev, newStream]);
    setLoading(false);
  }, []);

  return {
    streams,
    loading,
    getStream,
    getClaimable,
    handleWithdraw,
    handleCancel,
    handleCreateStream,
  };
}
