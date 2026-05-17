export interface DistributionState {
  id: string;
  authority: string;
  recipient: string;
  tokenMint: string;
  tokenSymbol: string;
  baseAmount: bigint;
  milestoneAmount: bigint;
  claimedAmount: bigint;
  startTime: number;
  endTime: number;
  cliffTime: number;
  milestoneAchieved: boolean;
  isCancelled: boolean;
}

export interface CreateStreamParams {
  recipient: string;
  tokenMint: string;
  tokenSymbol: string;
  baseAmount: number;
  milestoneAmount: number;
  startTime: number;
  endTime: number;
  cliffTime: number;
}

export interface StreamStats {
  totalStreams: number;
  activeStreams: number;
  totalClaimed: bigint;
  pendingMilestones: number;
}
