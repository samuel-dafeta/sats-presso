import { describe, it, expect, beforeEach } from "vitest";
import { Cl, ClarityType } from "@stacks/transactions";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

// Badge type constants (must match contract)
const BADGE_FIRST_SIP = 1;
const BADGE_REGULAR = 2;
const BADGE_CONNOISSEUR = 3;
const BADGE_WHALE = 4;

describe("sbt-badges Soul-Bound Token contract", () => {
  
  describe("initialization", () => {
    it("should have zero badges initially", () => {
      const result = simnet.callReadOnlyFn(
        "sbt-badges",
        "get-total-badges",
        [],
        deployer
      );
      expect(result.result).toBeUint(0);
    });

    it("should have badge type info for FIRST-SIP", () => {
      const result = simnet.callReadOnlyFn(
        "sbt-badges",
        "get-badge-type-info",
        [Cl.uint(BADGE_FIRST_SIP)],
        deployer
      );
      expect(result.result.type).toBe(ClarityType.OptionalSome);
    });
  });

  describe("recording tips", () => {
    it("should allow contract owner to record tips", () => {
      const result = simnet.callPublicFn(
        "sbt-badges",
        "record-tip",
        [Cl.principal(wallet1), Cl.uint(5000)],
        deployer
      );
      expect(result.result).toBeOk(Cl.bool(true));
    });

    it("should not allow non-owner to record tips", () => {
      const result = simnet.callPublicFn(
        "sbt-badges",
        "record-tip",
        [Cl.principal(wallet1), Cl.uint(5000)],
        wallet2
      );
      expect(result.result).toBeErr(Cl.uint(401)); // ERR-NOT-AUTHORIZED
    });

    it("should update user stats after recording tip", () => {
      // Record a tip
      simnet.callPublicFn(
        "sbt-badges",
        "record-tip",
        [Cl.principal(wallet1), Cl.uint(10000)],
        deployer
      );
      
      const result = simnet.callReadOnlyFn(
        "sbt-badges",
        "get-user-stats",
        [Cl.principal(wallet1)],
        deployer
      );
      expect(result.result.type).toBe(ClarityType.OptionalSome);
    });
  });

  describe("claiming badges", () => {
    it("should allow eligible user to claim FIRST-SIP badge", () => {
      // Record a tip first
      simnet.callPublicFn(
        "sbt-badges",
        "record-tip",
        [Cl.principal(wallet1), Cl.uint(1000)],
        deployer
      );
      
      // Claim badge (called by the user)
      const result = simnet.callPublicFn(
        "sbt-badges",
        "claim-badge",
        [Cl.uint(BADGE_FIRST_SIP)],
        wallet1
      );
      expect(result.result).toBeOk(Cl.uint(1)); // badge-id 1
    });

    it("should not allow claiming badge twice", () => {
      // Record tips
      simnet.callPublicFn(
        "sbt-badges",
        "record-tip",
        [Cl.principal(wallet2), Cl.uint(1000)],
        deployer
      );
      
      // Claim first time
      simnet.callPublicFn(
        "sbt-badges",
        "claim-badge",
        [Cl.uint(BADGE_FIRST_SIP)],
        wallet2
      );
      
      // Try to claim again
      const result = simnet.callPublicFn(
        "sbt-badges",
        "claim-badge",
        [Cl.uint(BADGE_FIRST_SIP)],
        wallet2
      );
      expect(result.result).toBeErr(Cl.uint(409)); // ERR-ALREADY-CLAIMED
    });

    it("should not allow claiming without eligibility", () => {
      // User hasn't tipped, try to claim FIRST-SIP
      const result = simnet.callPublicFn(
        "sbt-badges",
        "claim-badge",
        [Cl.uint(BADGE_FIRST_SIP)],
        wallet2
      );
      expect(result.result).toBeErr(Cl.uint(403)); // ERR-NOT-ELIGIBLE
    });

    it("should reject invalid badge types", () => {
      const result = simnet.callPublicFn(
        "sbt-badges",
        "claim-badge",
        [Cl.uint(99)], // Invalid badge type
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(400)); // ERR-INVALID-BADGE
    });
  });

  describe("REGULAR badge (10+ tips)", () => {
    it("should allow claiming after 10 tips", () => {
      // Record 10 tips
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          "sbt-badges",
          "record-tip",
          [Cl.principal(wallet1), Cl.uint(1000)],
          deployer
        );
      }
      
      // Claim REGULAR badge
      const result = simnet.callPublicFn(
        "sbt-badges",
        "claim-badge",
        [Cl.uint(BADGE_REGULAR)],
        wallet1
      );
      expect(result.result.type).toBe(ClarityType.ResponseOk);
    });
  });

  describe("soul-bound (non-transferable)", () => {
    it("should block all transfers", () => {
      // Get a badge first
      simnet.callPublicFn(
        "sbt-badges",
        "record-tip",
        [Cl.principal(wallet1), Cl.uint(1000)],
        deployer
      );
      simnet.callPublicFn(
        "sbt-badges",
        "claim-badge",
        [Cl.uint(BADGE_FIRST_SIP)],
        wallet1
      );
      
      // Try to transfer - should always fail
      const result = simnet.callPublicFn(
        "sbt-badges",
        "transfer",
        [Cl.uint(1), Cl.principal(wallet1), Cl.principal(wallet2)],
        wallet1
      );
      expect(result.result).toBeErr(Cl.uint(405)); // ERR-TRANSFER-BLOCKED
    });
  });

  describe("badge checking", () => {
    it("should correctly track which badges user has", () => {
      // Record tip
      simnet.callPublicFn(
        "sbt-badges",
        "record-tip",
        [Cl.principal(wallet1), Cl.uint(1000)],
        deployer
      );
      
      // Check before claim
      let result = simnet.callReadOnlyFn(
        "sbt-badges",
        "has-badge",
        [Cl.principal(wallet1), Cl.uint(BADGE_FIRST_SIP)],
        deployer
      );
      expect(result.result).toBeBool(false);
      
      // Claim
      simnet.callPublicFn(
        "sbt-badges",
        "claim-badge",
        [Cl.uint(BADGE_FIRST_SIP)],
        wallet1
      );
      
      // Check after claim
      result = simnet.callReadOnlyFn(
        "sbt-badges",
        "has-badge",
        [Cl.principal(wallet1), Cl.uint(BADGE_FIRST_SIP)],
        deployer
      );
      expect(result.result).toBeBool(true);
    });

    it("should return claimable badges for user", () => {
      // Record multiple tips to make user eligible
      for (let i = 0; i < 10; i++) {
        simnet.callPublicFn(
          "sbt-badges",
          "record-tip",
          [Cl.principal(wallet2), Cl.uint(5000)],
          deployer
        );
      }
      
      const result = simnet.callReadOnlyFn(
        "sbt-badges",
        "get-claimable-badges",
        [Cl.principal(wallet2)],
        deployer
      );
      expect(result.result.type).toBe(ClarityType.Tuple);
    });
  });

  describe("admin functions", () => {
    it("should allow admin to award special badges", () => {
      const result = simnet.callPublicFn(
        "sbt-badges",
        "award-badge",
        [Cl.principal(wallet1), Cl.uint(7)], // TOP-SUPPORTER
        deployer
      );
      expect(result.result.type).toBe(ClarityType.ResponseOk);
    });

    it("should not allow non-admin to award badges", () => {
      const result = simnet.callPublicFn(
        "sbt-badges",
        "award-badge",
        [Cl.principal(wallet1), Cl.uint(7)],
        wallet2
      );
      expect(result.result).toBeErr(Cl.uint(401)); // ERR-NOT-AUTHORIZED
    });
  });
});
