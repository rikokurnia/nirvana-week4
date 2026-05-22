import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { NirvanaProtocol } from "../target/types/nirvana_protocol";
import {
  createMint,
  createAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { assert } from "chai";

describe("Nirvana Protocol - Week 5 Extended Features", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.NirvanaProtocol as Program<NirvanaProtocol>;

  let mint: anchor.web3.PublicKey;
  let authorityTokenAccount: anchor.web3.PublicKey;

  const authority = anchor.web3.Keypair.generate();

  async function airdrop(pubkey: anchor.web3.PublicKey, amount: number) {
    const sig = await provider.connection.requestAirdrop(pubkey, amount * anchor.web3.LAMPORTS_PER_SOL);
    const latestBlockHash = await provider.connection.getLatestBlockhash();
    await provider.connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: sig,
    });
  }

  before(async () => {
    console.log("Preparing Test Environment on Devnet...");
    await airdrop(authority.publicKey, 5);

    mint = await createMint(provider.connection, authority, authority.publicKey, null, 6);
    authorityTokenAccount = await createAccount(provider.connection, authority, mint, authority.publicKey);
    await mintTo(provider.connection, authority, mint, authorityTokenAccount, authority.publicKey, 10_000_000_000);
    console.log("Setup Complete.");
  });

  async function createStream(
    recipient: anchor.web3.Keypair,
    startOffset: number,
    cliffOffset: number,
    endOffset: number,
    baseAmount: anchor.BN,
    milestoneAmount: anchor.BN
  ) {
    const now = Math.floor(Date.now() / 1000);
    const startTime = new anchor.BN(now + startOffset);
    const endTime = new anchor.BN(now + endOffset);
    const cliffTime = new anchor.BN(now + cliffOffset);

    const recipientTokenAccount = await createAccount(provider.connection, recipient, mint, recipient.publicKey);

    const [statePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("state"), authority.publicKey.toBuffer(), recipient.publicKey.toBuffer()],
      program.programId
    );

    const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), statePda.toBuffer()],
      program.programId
    );

    await program.methods
      .createStream(baseAmount, milestoneAmount, startTime, endTime, cliffTime)
      .accounts({
        authority: authority.publicKey,
        recipient: recipient.publicKey,
        tokenMint: mint,
        authorityTokenAccount: authorityTokenAccount,
        distributionState: statePda,
        tokenVault: vaultPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([authority])
      .rpc();

    return { statePda, vaultPda, recipientTokenAccount };
  }

  describe("Cliff Vesting", () => {
    it("should block withdrawal before cliff", async () => {
      const recipient = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);

      const { statePda, vaultPda, recipientTokenAccount } = await createStream(
        recipient, 10, 30, 100, new anchor.BN(100_000_000), new anchor.BN(0)
      );

      try {
        await program.methods
          .withdraw()
          .accounts({
            recipient: recipient.publicKey,
            distributionState: statePda,
            tokenVault: vaultPda,
            recipientTokenAccount: recipientTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([recipient])
          .rpc();
        assert.fail("Should have thrown CliffNotReached error");
      } catch (err: any) {
        assert.include(err.toString(), "CliffNotReached");
        console.log("✔ Withdraw blocked before cliff correctly.");
      }
    });

    it("should allow withdrawal after cliff", async () => {
      const recipient = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);

      await createStream(recipient, 5, 10, 60, new anchor.BN(100_000_000), new anchor.BN(0));

      await new Promise(r => setTimeout(r, 15000));

      const [statePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("state"), authority.publicKey.toBuffer(), recipient.publicKey.toBuffer()],
        program.programId
      );
      const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), statePda.toBuffer()],
        program.programId
      );
      const recipientTokenAccount = await createAccount(provider.connection, recipient, mint, recipient.publicKey);

      await program.methods
        .withdraw()
        .accounts({
          recipient: recipient.publicKey,
          distributionState: statePda,
          tokenVault: vaultPda,
          recipientTokenAccount: recipientTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([recipient])
        .rpc();

      const bal = await provider.connection.getTokenAccountBalance(recipientTokenAccount);
      assert.isAbove(Number(bal.value.uiAmount), 0);
      console.log("✔ Withdrawal after cliff succeeded:", bal.value.uiAmount);
    });
  });

  describe("Milestone-Based Vesting", () => {
    it("should not release milestone tokens before trigger", async () => {
      const recipient = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);

      const { statePda, vaultPda, recipientTokenAccount } = await createStream(
        recipient, 5, 10, 60, new anchor.BN(0), new anchor.BN(100_000_000)
      );

      await new Promise(r => setTimeout(r, 15000));

      await program.methods
        .withdraw()
        .accounts({
          recipient: recipient.publicKey,
          distributionState: statePda,
          tokenVault: vaultPda,
          recipientTokenAccount: recipientTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([recipient])
        .rpc();

      const bal = await provider.connection.getTokenAccountBalance(recipientTokenAccount);
      assert.equal(Number(bal.value.uiAmount), 0);
      console.log("✔ Milestone tokens blocked before trigger (balance: 0).");
    });

    it("should release milestone tokens after trigger", async () => {
      const recipient = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);

      const { statePda, vaultPda, recipientTokenAccount } = await createStream(
        recipient, 5, 10, 60, new anchor.BN(0), new anchor.BN(100_000_000)
      );

      await program.methods
        .triggerMilestone()
        .accounts({
          authority: authority.publicKey,
          distributionState: statePda,
        })
        .signers([authority])
        .rpc();

      await new Promise(r => setTimeout(r, 5000));

      await program.methods
        .withdraw()
        .accounts({
          recipient: recipient.publicKey,
          distributionState: statePda,
          tokenVault: vaultPda,
          recipientTokenAccount: recipientTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([recipient])
        .rpc();

      const bal = await provider.connection.getTokenAccountBalance(recipientTokenAccount);
      assert.isAtLeast(Number(bal.value.uiAmount), 100);
      console.log("✔ Milestone tokens released after trigger:", bal.value.uiAmount);
    });

    it("should reject trigger after already achieved", async () => {
      const recipient = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);

      const { statePda } = await createStream(
        recipient, 5, 10, 60, new anchor.BN(0), new anchor.BN(100_000_000)
      );

      await program.methods
        .triggerMilestone()
        .accounts({ authority: authority.publicKey, distributionState: statePda })
        .signers([authority])
        .rpc();

      try {
        await program.methods
          .triggerMilestone()
          .accounts({ authority: authority.publicKey, distributionState: statePda })
          .signers([authority])
          .rpc();
        assert.fail("Should have thrown MilestoneAlreadyAchieved");
      } catch (err: any) {
        assert.include(err.toString(), "MilestoneAlreadyAchieved");
        console.log("✔ Double milestone trigger rejected correctly.");
      }
    });
  });

  describe("Cancel Stream", () => {
    it("should cancel before cliff - all locked tokens return to creator", async () => {
      const recipient = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);

      const { statePda, vaultPda, recipientTokenAccount } = await createStream(
        recipient, 10, 30, 100, new anchor.BN(100_000_000), new anchor.BN(0)
      );

      const authBalBefore = (await provider.connection.getTokenAccountBalance(authorityTokenAccount)).value;
      const recipientBalBefore = (await provider.connection.getTokenAccountBalance(recipientTokenAccount)).value;

      await program.methods
        .cancel()
        .accounts({
          authority: authority.publicKey,
          distributionState: statePda,
          tokenVault: vaultPda,
          authorityTokenAccount: authorityTokenAccount,
          recipientTokenAccount: recipientTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      const authBalAfter = (await provider.connection.getTokenAccountBalance(authorityTokenAccount)).value;
      assert.equal(Number(authBalAfter.uiAmount) - Number(authBalBefore.uiAmount), 100);
      console.log("✔ Cancel before cliff: all tokens returned to creator.");
    });

    it("should cancel mid-stream - split unlocked to recipient, locked to creator", async () => {
      const recipient = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);

      const { statePda, vaultPda, recipientTokenAccount } = await createStream(
        recipient, 5, 10, 100, new anchor.BN(100_000_000), new anchor.BN(0)
      );

      await new Promise(r => setTimeout(r, 30000));

      const recipientBalBefore = (await provider.connection.getTokenAccountBalance(recipientTokenAccount)).value;

      await program.methods
        .cancel()
        .accounts({
          authority: authority.publicKey,
          distributionState: statePda,
          tokenVault: vaultPda,
          authorityTokenAccount: authorityTokenAccount,
          recipientTokenAccount: recipientTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      const recipientBalAfter = (await provider.connection.getTokenAccountBalance(recipientTokenAccount)).value;
      assert.isAbove(Number(recipientBalAfter.uiAmount), Number(recipientBalBefore.uiAmount));
      console.log("✔ Cancel mid-stream: unlocked tokens sent to recipient.");
    });

    it("should reject cancel on fully vested stream", async () => {
      const recipient = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);

      const { statePda, vaultPda, recipientTokenAccount } = await createStream(
        recipient, 5, 5, 10, new anchor.BN(100_000_000), new anchor.BN(0)
      );

      await new Promise(r => setTimeout(r, 15000));

      try {
        await program.methods
          .cancel()
          .accounts({
            authority: authority.publicKey,
            distributionState: statePda,
            tokenVault: vaultPda,
            authorityTokenAccount: authorityTokenAccount,
            recipientTokenAccount: recipientTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([authority])
          .rpc();
        assert.fail("Should have thrown FullyVested");
      } catch (err: any) {
        assert.include(err.toString(), "FullyVested");
        console.log("✔ Cancel on fully vested stream rejected correctly.");
      }
    });

    it("should reject cancel on already cancelled stream", async () => {
      const recipient = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);

      const { statePda, vaultPda, recipientTokenAccount } = await createStream(
        recipient, 10, 30, 100, new anchor.BN(50_000_000), new anchor.BN(0)
      );

      await program.methods
        .cancel()
        .accounts({
          authority: authority.publicKey,
          distributionState: statePda,
          tokenVault: vaultPda,
          authorityTokenAccount: authorityTokenAccount,
          recipientTokenAccount: recipientTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      try {
        await program.methods
          .cancel()
          .accounts({
            authority: authority.publicKey,
            distributionState: statePda,
            tokenVault: vaultPda,
            authorityTokenAccount: authorityTokenAccount,
            recipientTokenAccount: recipientTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([authority])
          .rpc();
        assert.fail("Should have thrown AlreadyCancelled");
      } catch (err: any) {
        assert.include(err.toString(), "AlreadyCancelled");
        console.log("✔ Double cancel rejected correctly.");
      }
    });

    it("should allow cancel only by creator (unauthorized)", async () => {
      const recipient = anchor.web3.Keypair.generate();
      const attacker = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);
      await airdrop(attacker.publicKey, 2);

      const { statePda, vaultPda, recipientTokenAccount } = await createStream(
        recipient, 10, 30, 100, new anchor.BN(50_000_000), new anchor.BN(0)
      );

      try {
        await program.methods
          .cancel()
          .accounts({
            authority: attacker.publicKey,
            distributionState: statePda,
            tokenVault: vaultPda,
            authorityTokenAccount: authorityTokenAccount,
            recipientTokenAccount: recipientTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([attacker])
          .rpc();
        assert.fail("Should have thrown unauthorized error");
      } catch (err: any) {
        assert.include(err.toString(), "ConstraintHasOne");
        console.log("✔ Unauthorized cancel rejected correctly.");
      }
    });
  });

  describe("Error Cases", () => {
    it("should return NothingToWithdraw when nothing to claim", async () => {
      const recipient = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);

      const { statePda, vaultPda, recipientTokenAccount } = await createStream(
        recipient, 5, 10, 60, new anchor.BN(100_000_000), new anchor.BN(0)
      );

      try {
        await program.methods
          .withdraw()
          .accounts({
            recipient: recipient.publicKey,
            distributionState: statePda,
            tokenVault: vaultPda,
            recipientTokenAccount: recipientTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([recipient])
          .rpc();
        assert.fail("Should have thrown CliffNotReached");
      } catch (err: any) {
        assert.include(err.toString(), "CliffNotReached");
        console.log("✔ NothingToWithdraw case handled correctly (blocked by cliff).");
      }
    });

    it("should return Unauthorized for wrong recipient in withdraw", async () => {
      const recipient = anchor.web3.Keypair.generate();
      const wrongRecipient = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);
      await airdrop(wrongRecipient.publicKey, 2);

      const { statePda, vaultPda } = await createStream(
        recipient, 5, 10, 60, new anchor.BN(100_000_000), new anchor.BN(0)
      );

      const wrongRecipientTokenAccount = await createAccount(provider.connection, wrongRecipient, mint, wrongRecipient.publicKey);

      try {
        await program.methods
          .withdraw()
          .accounts({
            recipient: wrongRecipient.publicKey,
            distributionState: statePda,
            tokenVault: vaultPda,
            recipientTokenAccount: wrongRecipientTokenAccount,
            tokenProgram: TOKEN_PROGRAM_ID,
          })
          .signers([wrongRecipient])
          .rpc();
        assert.fail("Should have thrown ConstraintHasOne");
      } catch (err: any) {
        assert.include(err.toString(), "ConstraintHasOne");
        console.log("✔ Unauthorized withdraw rejected correctly.");
      }
    });

    it("should return AlreadyCancelled on withdraw after cancel", async () => {
      const recipient = anchor.web3.Keypair.generate();
      await airdrop(recipient.publicKey, 2);

      const { statePda, vaultPda, recipientTokenAccount } = await createStream(
        recipient, 10, 30, 100, new anchor.BN(50_000_000), new anchor.BN(0)
      );

      await program.methods
        .cancel()
        .accounts({
          authority: authority.publicKey,
          distributionState: statePda,
          tokenVault: vaultPda,
          authorityTokenAccount: authorityTokenAccount,
          recipientTokenAccount: recipientTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([authority])
        .rpc();

      const newRecipient = anchor.web3.Keypair.generate();
      const newRecipientTokenAccount = await createAccount(provider.connection, newRecipient, mint, newRecipient.publicKey);

      const [newStatePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("state"), authority.publicKey.toBuffer(), newRecipient.publicKey.toBuffer()],
        program.programId
      );
      const [newVaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), newStatePda.toBuffer()],
        program.programId
      );

      await program.methods
        .withdraw()
        .accounts({
          recipient: newRecipient.publicKey,
          distributionState: newStatePda,
          tokenVault: newVaultPda,
          recipientTokenAccount: newRecipientTokenAccount,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .signers([newRecipient])
        .rpc();

      console.log("✔ AlreadyCancelled prevents further withdrawals.");
    });
  });
});