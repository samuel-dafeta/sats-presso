import { describe, it, expect, beforeEach } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

describe("tip-receipts NFT contract", () => {
  
  describe("SIP-009 compliance", () => {
    it("should return last token id as 0 initially", () => {
      const result = simnet.callReadOnlyFn(
        "tip-receipts",
        "get-last-token-id",
        [],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(0));
    });

    it("should return token URI", () => {
      const result = simnet.callReadOnlyFn(
        "tip-receipts",
        "get-token-uri",
        [Cl.uint(1)],
        deployer
      );
      expect(result.result.type).toBe(ClarityType.ResponseOk);
    });

    it("should return none for non-existent token owner", () => {
      const result = simnet.callReadOnlyFn(
        "tip-receipts",
        "get-owner",
        [Cl.uint(999)],
        deployer
      );
      expect(result.result).toBeOk(Cl.none());
    });
  });

  describe("tier calculation", () => {
    it("should return BRONZE for tips under 1000 sats", () => {
      const result = simnet.callReadOnlyFn(
        "tip-receipts",
        "get-tier",
        [Cl.uint(500)],
        deployer
      );
      expect(result.result).toBeUint(1); // TIER-BRONZE
    });

    it("should return SILVER for tips 1000-9999 sats", () => {
      const result = simnet.callReadOnlyFn(
        "tip-receipts",
        "get-tier",
        [Cl.uint(5000)],
        deployer
      );
      expect(result.result).toBeUint(2); // TIER-SILVER
    });

    it("should return GOLD for tips 10000-99999 sats", () => {
      const result = simnet.callReadOnlyFn(
        "tip-receipts",
        "get-tier",
        [Cl.uint(50000)],
        deployer
      );
      expect(result.result).toBeUint(3); // TIER-GOLD
    });

    it("should return DIAMOND for tips 100000+ sats", () => {
      const result = simnet.callReadOnlyFn(
        "tip-receipts",
        "get-tier",
        [Cl.uint(100000)],
        deployer
      );
      expect(result.result).toBeUint(4); // TIER-DIAMOND
    });
  });

  describe("minting receipts", () => {
    it("should mint a receipt for a tip", () => {
      const result = simnet.callPublicFn(
        "tip-receipts",
        "mint-receipt",
        [
          Cl.uint(1),           // tip-id
          Cl.principal(wallet1), // tipper
          Cl.principal(wallet2), // creator
          Cl.uint(5000),        // amount (SILVER tier)
        ],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(1)); // token-id 1
    });

    it("should increment last-token-id after minting", () => {
      // Mint first - fresh state so token-id will be 1
      simnet.callPublicFn(
        "tip-receipts",
        "mint-receipt",
        [
          Cl.uint(100), // tip-id doesn't affect token-id
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(1000),
        ],
        deployer
      );
      
      const result = simnet.callReadOnlyFn(
        "tip-receipts",
        "get-last-token-id",
        [],
        deployer
      );
      expect(result.result).toBeOk(Cl.uint(1)); // First mint = token-id 1
    });

    it("should not allow duplicate minting for same tip", () => {
      // First mint
      simnet.callPublicFn(
        "tip-receipts",
        "mint-receipt",
        [
          Cl.uint(3),
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(1000),
        ],
        deployer
      );
      
      // Try to mint again
      const result = simnet.callPublicFn(
        "tip-receipts",
        "mint-receipt",
        [
          Cl.uint(3), // same tip-id
          Cl.principal(wallet1),
          Cl.principal(wallet2),
          Cl.uint(1000),
        ],
        deployer
      );
      expect(result.result).toBeErr(Cl.uint(409)); // ERR-ALREADY-MINTED
    });

    it("should set correct owner after minting", () => {
      // Fresh state - first mint gets token-id 1
      simnet.callPublicFn(
        "tip-receipts",
        "mint-receipt",
        [
          Cl.uint(4),
          Cl.principal(wallet1), // tipper becomes owner
          Cl.principal(wallet2),
          Cl.uint(10000),
        ],
        deployer
      );
      
      // Look up token-id 1 (not tip-id 4)
      const result = simnet.callReadOnlyFn(
        "tip-receipts",
        "get-owner",
        [Cl.uint(1)], // token-id 1, not tip-id
        deployer
      );
      expect(result.result).toBeOk(Cl.some(Cl.principal(wallet1)));
    });
  });

  describe("tier counts", () => {
    it("should track tier counts per user", () => {
      // Mint bronze
      simnet.callPublicFn(
        "tip-receipts",
        "mint-receipt",
        [Cl.uint(10), Cl.principal(wallet1), Cl.principal(wallet2), Cl.uint(500)],
        deployer
      );
      
      // Mint silver
      simnet.callPublicFn(
        "tip-receipts",
        "mint-receipt",
        [Cl.uint(11), Cl.principal(wallet1), Cl.principal(wallet2), Cl.uint(5000)],
        deployer
      );
      
      // Mint gold
      simnet.callPublicFn(
        "tip-receipts",
        "mint-receipt",
        [Cl.uint(12), Cl.principal(wallet1), Cl.principal(wallet2), Cl.uint(50000)],
        deployer
      );
      
      const result = simnet.callReadOnlyFn(
        "tip-receipts",
        "get-user-tier-counts",
        [Cl.principal(wallet1)],
        deployer
      );
      
      const counts = result.result;
      expect(counts.type).toBe(ClarityType.Tuple);
    });
  });

  describe("transfers", () => {
    it("should allow owner to transfer NFT", () => {
      // Mint to wallet1 - fresh state, token-id will be 1
      simnet.callPublicFn(
        "tip-receipts",
        "mint-receipt",
        [Cl.uint(20), Cl.principal(wallet1), Cl.principal(wallet2), Cl.uint(1000)],
        deployer
      );
      
      // Transfer token-id 1 from wallet1 to wallet2
      const result = simnet.callPublicFn(
        "tip-receipts",
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)], // token-id 1
        wallet1
      );
      // Should succeed
      expect(result.result.type).toBe(ClarityType.ResponseOk);
    });

    it("should not allow non-owner to transfer", () => {
      // Mint to wallet1 - fresh state, token-id will be 1
      simnet.callPublicFn(
        "tip-receipts",
        "mint-receipt",
        [Cl.uint(21), Cl.principal(wallet1), Cl.principal(wallet2), Cl.uint(1000)],
        deployer
      );
      
      // Try to transfer token-id 1 from wallet2 (not owner)
      const result = simnet.callPublicFn(
        "tip-receipts",
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)], // token-id 1
        wallet2 // not the owner
      );
      expect(result.result).toBeErr(Cl.uint(401)); // ERR-NOT-AUTHORIZED
    });
  });
});
