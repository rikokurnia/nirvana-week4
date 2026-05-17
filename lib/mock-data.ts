import type { DistributionState } from "./types";

const now = Date.now() / 1000;
const day = 86400;
const month = day * 30;

export const MOCK_STREAMS: DistributionState[] = [
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
    recipient: "5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8",
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
  {
    id: "stream_004",
    authority: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    recipient: "5YNmS1R9nNSCDzb5a7mMJ1dwK9uHeAAF4CmPEwKgVWr8",
    tokenMint: "So11111111111111111111111111111111111111112",
    tokenSymbol: "SOL",
    baseAmount: BigInt(300_000_000_000),
    milestoneAmount: BigInt(100_000_000_000),
    claimedAmount: BigInt(300_000_000_000),
    startTime: now - month * 12,
    endTime: now - month,
    cliffTime: now - month * 11,
    milestoneAchieved: true,
    isCancelled: false,
  },
];

export const DEVNET_RPC = "https://api.devnet.solana.com";
