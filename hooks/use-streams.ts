"use client";

import { useState, useCallback, useEffect } from "react";
import type { DistributionState } from "@/lib/types";
import { calculateClaimable } from "@/lib/utils";

const STORAGE_KEY = "nirvana_streams";

const now = Date.now() / 1000;
const day = 86400;
const month = day * 30;

const WORKER_MOCK: DistributionState[] = [
  {
    id: "stream_001",
    authority: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    recipient: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
    tokenMint: "So11111111111111111111111111111111111111112",
    tokenSymbol: "SOL",
    baseAmount: BigInt(500_000_000_000),
    milestoneAmount: BigInt(200_000_000_000),
    claimedAmount: BigInt(125_000_000_000),
    startTime: now - month * 3,
    endTime: now + month * 9,
    cliffTime: now - month * 2,
    milestoneAchieved: true,
    isCancelled: false,
  },
  {
    id: "stream_002",
    authority: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    recipient: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
    tokenMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    tokenSymbol: "USDC",
    baseAmount: BigInt(100_000_000_000),
    milestoneAmount: BigInt(50_000_000_000),
    claimedAmount: BigInt(0),
    startTime: now - month,
    endTime: now + month * 11,
    cliffTime: now + month * 2,
    milestoneAchieved: false,
    isCancelled: false,
  },
  {
    id: "stream_003",
    authority: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    recipient: "DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK",
    tokenMint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    tokenSymbol: "BONK",
    baseAmount: BigInt(1_000_000_000_000),
    milestoneAmount: BigInt(500_000_000_000),
    claimedAmount: BigInt(400_000_000_000),
    startTime: now - month * 6,
    endTime: now + month * 6,
    cliffTime: now - month * 5,
    milestoneAchieved: false,
    isCancelled: false,
  },
];

function serialize(streams: DistributionState[]): string {
  return JSON.stringify(
    streams.map((s) => ({
      ...s,
      baseAmount: s.baseAmount.toString(),
      milestoneAmount: s.milestoneAmount.toString(),
      claimedAmount: s.claimedAmount.toString(),
    }))
  );
}

function deserialize(raw: string): DistributionState[] {
  try {
    return JSON.parse(raw).map(
      (s: Record<string, unknown>) =>
        ({
          ...s,
          baseAmount: BigInt(String(s.baseAmount)),
          milestoneAmount: BigInt(String(s.milestoneAmount)),
          claimedAmount: BigInt(String(s.claimedAmount)),
        } as DistributionState)
    );
  } catch {
    return [];
  }
}

export function useStreams() {
  const [streams, setStreams] = useState<DistributionState[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setStreams(deserialize(stored));
    }
  }, []);

  const persist = useCallback((next: DistributionState[]) => {
    setStreams(next);
    localStorage.setItem(STORAGE_KEY, serialize(next));
  }, []);

  const getWorkerStreams = useCallback(
    (workerAddress: string): DistributionState[] => {
      const saved = streams.filter((s) => s.recipient === workerAddress);
      const merged = [...saved];
      for (const mock of WORKER_MOCK) {
        if (!merged.find((s) => s.id === mock.id)) {
          merged.push(mock);
        }
      }
      return merged;
    },
    [streams]
  );

  const getStream = useCallback(
    (id: string) => streams.find((s) => s.id === id) || WORKER_MOCK.find((s) => s.id === id),
    [streams]
  );

  const getClaimable = useCallback((stream: DistributionState) => {
    return calculateClaimable(stream);
  }, []);

  const handleWithdraw = useCallback(
    async (streamId: string) => {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 1500));
      setStreams((prev) => {
        const next = prev.map((s) => {
          if (s.id !== streamId) return s;
          const claimable = calculateClaimable(s);
          return { ...s, claimedAmount: s.claimedAmount + claimable };
        });
        localStorage.setItem(STORAGE_KEY, serialize(next));
        return next;
      });
      setLoading(false);
    },
    []
  );

  const handleCancel = useCallback(async (streamId: string) => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setStreams((prev) => {
      const next = prev.map((s) =>
        s.id === streamId ? { ...s, isCancelled: true } : s
      );
      localStorage.setItem(STORAGE_KEY, serialize(next));
      return next;
    });
    setLoading(false);
  }, []);

  const handleCreateStream = useCallback(
    async (params: {
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
        id: `stream_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
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
      setStreams((prev) => {
        const next = [...prev, newStream];
        localStorage.setItem(STORAGE_KEY, serialize(next));
        return next;
      });
      setLoading(false);
    },
    []
  );

  return {
    streams,
    loading,
    getStream,
    getClaimable,
    getWorkerStreams,
    handleWithdraw,
    handleCancel,
    handleCreateStream,
  };
}
