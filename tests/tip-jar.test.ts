import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it, beforeEach } from "vitest";

// Get test accounts
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const creator1 = accounts.get("wallet_1")!;
const creator2 = accounts.get("wallet_2")!;
const tipper1 = accounts.get("wallet_3")!;
const tipper2 = accounts.get("wallet_4")!;

// sBTC contract reference
const SBTC_TOKEN = "SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token";

// Contract name
const CONTRACT_NAME = "tip-jar";

// Note: Wallets are automatically funded with sBTC (1,000,000,000 sats each) in simnet

// Helper to get sBTC balance
function getSbtcBalance(address: string): bigint {
  const result = simnet.callReadOnlyFn(
    SBTC_TOKEN,
    "get-balance",
    [Cl.principal(address)],
    deployer
  );
  if (result.result.type === ClarityType.ResponseOk) {
    const inner = result.result.value;
    if (inner.type === ClarityType.UInt) {
      return inner.value;
    }
  }
  return BigInt(0);
}

describe("Sats-Presso Tip Jar Contract", () => {
  
  describe("Creator Registration", () => {
    
    it("allows a user to register as a creator", () => {
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [
          Cl.stringUtf8("Alice Creator"),
          Cl.stringUtf8("I make awesome Bitcoin content!")
        ],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      // Verify event was emitted
      expect(events.length).toBeGreaterThan(0);
      const printEvent = events.find(e => e.event === "print_event");
      expect(printEvent).toBeDefined();
    });
    
    it("prevents duplicate registration", () => {
      // First registration
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Bob"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      // Try to register again
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Bob Again"), Cl.stringUtf8("New bio")],
        creator1
      );
      
      // Should fail with ERR_ALREADY_REGISTERED (u102)
      expect(result).toBeErr(Cl.uint(102));
    });
    
    it("rejects empty name", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8(""), Cl.stringUtf8("Bio")],
        creator1
      );
      
      // Should fail with ERR_INVALID_NAME (u105)
      expect(result).toBeErr(Cl.uint(105));
    });
    
    it("increments total creators count", () => {
      // Register first creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Creator One"), Cl.stringUtf8("Bio 1")],
        creator1
      );
      
      let countResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-creators",
        [],
        deployer
      );
      expect(countResult.result).toBeUint(1);
      
      // Register second creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Creator Two"), Cl.stringUtf8("Bio 2")],
        creator2
      );
      
      countResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-creators",
        [],
        deployer
      );
      expect(countResult.result).toBeUint(2);
    });
  });
  
  describe("Profile Management", () => {
    
    it("allows creator to update their profile", () => {
      // Register first
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Original Name"), Cl.stringUtf8("Original bio")],
        creator1
      );
      
      // Update profile
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "update-profile",
        [Cl.stringUtf8("New Name"), Cl.stringUtf8("Updated bio with more details")],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      // Verify update
      const profileResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-creator",
        [Cl.principal(creator1)],
        deployer
      );
      
      expect(profileResult.result).toBeSome(
        Cl.tuple({
          name: Cl.stringUtf8("New Name"),
          bio: Cl.stringUtf8("Updated bio with more details"),
          "total-received": Cl.uint(0),
          "tip-count": Cl.uint(0),
          "registered-at": Cl.uint(simnet.burnBlockHeight)
        })
      );
    });
    
    it("prevents non-creator from updating profile", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "update-profile",
        [Cl.stringUtf8("Hacker"), Cl.stringUtf8("Not allowed")],
        tipper1
      );
      
      // Should fail with ERR_CREATOR_NOT_FOUND (u101)
      expect(result).toBeErr(Cl.uint(101));
    });
  });
  
  describe("Tipping with sBTC", () => {
    
    it("allows tipping a registered creator", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Content Creator"), Cl.stringUtf8("Making great stuff")],
        creator1
      );
      
      // Wallets are auto-funded with sBTC in simnet
      const tipAmount = 1000; // 1000 sats
      
      // Get initial balances
      const creatorBalanceBefore = getSbtcBalance(creator1);
      const tipperBalanceBefore = getSbtcBalance(tipper1);
      
      // Send tip
      const { result, events } = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [
          Cl.principal(creator1),
          Cl.uint(tipAmount),
          Cl.stringUtf8("Great content! Keep it up!")
        ],
        tipper1
      );
      
      expect(result).toBeOk(Cl.uint(1)); // First tip, ID = 1
      
      // Verify balances changed
      const creatorBalanceAfter = getSbtcBalance(creator1);
      const tipperBalanceAfter = getSbtcBalance(tipper1);
      
      expect(creatorBalanceAfter - creatorBalanceBefore).toBe(BigInt(tipAmount));
      expect(tipperBalanceBefore - tipperBalanceAfter).toBe(BigInt(tipAmount));
    });
    
    it("rejects tip to non-registered creator", () => {
      // Try to tip non-registered user
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [
          Cl.principal(creator2), // Not registered
          Cl.uint(100),
          Cl.stringUtf8("Test")
        ],
        tipper1
      );
      
      // Should fail with ERR_CREATOR_NOT_FOUND (u101)
      expect(result).toBeErr(Cl.uint(101));
    });
    
    it("rejects tip with zero amount", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Creator"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      // Try to tip zero
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [
          Cl.principal(creator1),
          Cl.uint(0),
          Cl.stringUtf8("Zero tip")
        ],
        tipper1
      );
      
      // Should fail with ERR_INVALID_AMOUNT (u103)
      expect(result).toBeErr(Cl.uint(103));
    });
    
    it("updates creator stats after tip", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Stats Creator"), Cl.stringUtf8("Testing stats")],
        creator1
      );
      
      // Send tips
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(500), Cl.stringUtf8("Tip 1")],
        tipper1
      );
      
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(300), Cl.stringUtf8("Tip 2")],
        tipper2
      );
      
      // Check creator stats
      const profileResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-creator",
        [Cl.principal(creator1)],
        deployer
      );
      
      // Verify total-received and tip-count
      if (profileResult.result.type === ClarityType.OptionalSome) {
        const profile = profileResult.result.value;
        if (profile.type === ClarityType.Tuple) {
          const totalReceived = profile.value["total-received"];
          const tipCount = profile.value["tip-count"];
          expect(totalReceived).toBeUint(800); // 500 + 300
          expect(tipCount).toBeUint(2);
        }
      }
    });
    
    it("records tip history correctly", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("History Creator"), Cl.stringUtf8("Testing history")],
        creator1
      );
      
      // Send tip
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(100), Cl.stringUtf8("Hello from tipper!")],
        tipper1
      );
      
      // Get tip by ID
      const tipResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-tip",
        [Cl.uint(1)],
        deployer
      );
      
      expect(tipResult.result).toBeSome(
        Cl.tuple({
          from: Cl.principal(tipper1),
          to: Cl.principal(creator1),
          amount: Cl.uint(100),
          message: Cl.stringUtf8("Hello from tipper!"),
          timestamp: Cl.uint(simnet.burnBlockHeight)
        })
      );
    });
  });
  
  describe("Read-Only Functions", () => {
    
    it("returns correct total tips processed", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Creator"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      // Send tips
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(1000), Cl.stringUtf8("Tip")],
        tipper1
      );
      
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(2000), Cl.stringUtf8("Another tip")],
        tipper1
      );
      
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-total-tips-processed",
        [],
        deployer
      );
      
      expect(result.result).toBeUint(3000); // 1000 + 2000
    });
    
    it("correctly identifies registered creators", () => {
      // Register one creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Registered"), Cl.stringUtf8("I am registered")],
        creator1
      );
      
      // Check registered creator
      let result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-creator",
        [Cl.principal(creator1)],
        deployer
      );
      expect(result.result).toBeBool(true);
      
      // Check non-registered
      result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "is-creator",
        [Cl.principal(creator2)],
        deployer
      );
      expect(result.result).toBeBool(false);
    });
    
    it("returns correct tip count", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Creator"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      // Send tips
      for (let i = 0; i < 5; i++) {
        simnet.callPublicFn(
          CONTRACT_NAME,
          "send-tip",
          [Cl.principal(creator1), Cl.uint(10), Cl.stringUtf8(`Tip ${i + 1}`)],
          tipper1
        );
      }
      
      const result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-tip-count",
        [],
        deployer
      );
      
      expect(result.result).toBeUint(5);
    });
  });
  
  describe("Creator Goals/Campaigns", () => {
    
    it("allows creator to set a funding goal", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Goal Creator"), Cl.stringUtf8("Testing goals")],
        creator1
      );
      
      // Set goal
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-goal",
        [
          Cl.uint(100000), // 100,000 sats
          Cl.stringUtf8("Save for new microphone"),
          Cl.uint(1000) // deadline block
        ],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      // Verify goal
      const goalResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-creator-goal",
        [Cl.principal(creator1)],
        deployer
      );
      
      expect(goalResult.result).toBeSome(
        Cl.tuple({
          "goal-amount": Cl.uint(100000),
          "goal-description": Cl.stringUtf8("Save for new microphone"),
          "goal-deadline": Cl.uint(1000),
          "goal-active": Cl.bool(true)
        })
      );
    });
    
    it("rejects goal from non-creator", () => {
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-goal",
        [Cl.uint(50000), Cl.stringUtf8("Not allowed"), Cl.uint(500)],
        tipper1 // Not a registered creator
      );
      
      expect(result).toBeErr(Cl.uint(101)); // ERR_CREATOR_NOT_FOUND
    });
    
    it("allows creator to deactivate goal", () => {
      // Register and set goal
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Goal Creator"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      simnet.callPublicFn(
        CONTRACT_NAME,
        "set-goal",
        [Cl.uint(50000), Cl.stringUtf8("My goal"), Cl.uint(500)],
        creator1
      );
      
      // Deactivate
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "deactivate-goal",
        [],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      // Verify deactivated
      const goalResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-creator-goal",
        [Cl.principal(creator1)],
        deployer
      );
      
      if (goalResult.result.type === ClarityType.OptionalSome) {
        const goal = goalResult.result.value;
        if (goal.type === ClarityType.Tuple) {
          expect(goal.value["goal-active"]).toBeBool(false);
        }
      }
    });
    
    it("tracks goal progress correctly", () => {
      // Register creator with goal
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Progress Creator"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      simnet.callPublicFn(
        CONTRACT_NAME,
        "set-goal",
        [Cl.uint(10000), Cl.stringUtf8("10k sats goal"), Cl.uint(1000)],
        creator1
      );
      
      // Send tip toward goal
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(2500), Cl.stringUtf8("25% progress!")],
        tipper1
      );
      
      // Check progress
      const progressResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-goal-progress",
        [Cl.principal(creator1)],
        deployer
      );
      
      if (progressResult.result.type === ClarityType.OptionalSome) {
        const progress = progressResult.result.value;
        if (progress.type === ClarityType.Tuple) {
          expect(progress.value["goal-amount"]).toBeUint(10000);
          expect(progress.value["raised"]).toBeUint(2500);
          expect(progress.value["remaining"]).toBeUint(7500);
          expect(progress.value["percentage"]).toBeUint(25);
        }
      }
    });
  });
  
  describe("Preset Tip Amounts", () => {
    
    it("initializes default presets on registration", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Preset Creator"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      // Check default presets
      const presetsResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-creator-presets",
        [Cl.principal(creator1)],
        deployer
      );
      
      expect(presetsResult.result).toBeSome(
        Cl.tuple({
          "preset-1": Cl.uint(1000),
          "preset-2": Cl.uint(5000),
          "preset-3": Cl.uint(10000),
          "preset-4": Cl.uint(25000),
          "preset-5": Cl.uint(50000)
        })
      );
    });
    
    it("allows creator to set custom presets", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Custom Preset"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      // Set custom presets
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-presets",
        [
          Cl.uint(500),
          Cl.uint(2000),
          Cl.uint(5000),
          Cl.uint(15000),
          Cl.uint(100000)
        ],
        creator1
      );
      
      expect(result).toBeOk(Cl.bool(true));
      
      // Verify custom presets
      const presetsResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-creator-presets",
        [Cl.principal(creator1)],
        deployer
      );
      
      expect(presetsResult.result).toBeSome(
        Cl.tuple({
          "preset-1": Cl.uint(500),
          "preset-2": Cl.uint(2000),
          "preset-3": Cl.uint(5000),
          "preset-4": Cl.uint(15000),
          "preset-5": Cl.uint(100000)
        })
      );
    });
    
    it("rejects zero value presets", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Creator"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      // Try to set preset with zero
      const { result } = simnet.callPublicFn(
        CONTRACT_NAME,
        "set-presets",
        [
          Cl.uint(100),
          Cl.uint(0), // Invalid!
          Cl.uint(500),
          Cl.uint(1000),
          Cl.uint(5000)
        ],
        creator1
      );
      
      expect(result).toBeErr(Cl.uint(107)); // ERR_INVALID_PRESET
    });
  });
  
  describe("Tip History Queries", () => {
    
    it("tracks tips by creator correctly", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("History Creator"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      // Send multiple tips
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(100), Cl.stringUtf8("Tip A")],
        tipper1
      );
      
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(200), Cl.stringUtf8("Tip B")],
        tipper2
      );
      
      // Get tips by creator index
      const tip1Result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-creator-tip-at-index",
        [Cl.principal(creator1), Cl.uint(0)],
        deployer
      );
      expect(tip1Result.result).toBeSome(Cl.uint(1)); // First tip ID = 1
      
      const tip2Result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-creator-tip-at-index",
        [Cl.principal(creator1), Cl.uint(1)],
        deployer
      );
      expect(tip2Result.result).toBeSome(Cl.uint(2)); // Second tip ID = 2
    });
    
    it("tracks tips by tipper correctly", () => {
      // Register creators
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Creator A"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Creator B"), Cl.stringUtf8("Bio")],
        creator2
      );
      
      // Tipper sends to multiple creators
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(100), Cl.stringUtf8("To creator 1")],
        tipper1
      );
      
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator2), Cl.uint(150), Cl.stringUtf8("To creator 2")],
        tipper1
      );
      
      // Get tips by tipper index
      const tip1Result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-tipper-tip-at-index",
        [Cl.principal(tipper1), Cl.uint(0)],
        deployer
      );
      expect(tip1Result.result).toBeSome(Cl.uint(1));
      
      const tip2Result = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-tipper-tip-at-index",
        [Cl.principal(tipper1), Cl.uint(1)],
        deployer
      );
      expect(tip2Result.result).toBeSome(Cl.uint(2));
    });
    
    it("returns correct tipper tip count", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Creator"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      // No tips yet
      let countResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-tipper-tip-count",
        [Cl.principal(tipper1)],
        deployer
      );
      expect(countResult.result).toBeUint(0);
      
      // Send tips
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(100), Cl.stringUtf8("Tip 1")],
        tipper1
      );
      
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(100), Cl.stringUtf8("Tip 2")],
        tipper1
      );
      
      countResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-tipper-tip-count",
        [Cl.principal(tipper1)],
        deployer
      );
      expect(countResult.result).toBeUint(2);
    });
    
    it("returns recent tips correctly", () => {
      // Register creator
      simnet.callPublicFn(
        CONTRACT_NAME,
        "register-creator",
        [Cl.stringUtf8("Creator"), Cl.stringUtf8("Bio")],
        creator1
      );
      
      // Send 3 tips
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(100), Cl.stringUtf8("Tip 1")],
        tipper1
      );
      
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(200), Cl.stringUtf8("Tip 2")],
        tipper1
      );
      
      simnet.callPublicFn(
        CONTRACT_NAME,
        "send-tip",
        [Cl.principal(creator1), Cl.uint(300), Cl.stringUtf8("Tip 3")],
        tipper1
      );
      
      // Get recent tips (0 = most recent, 1 = second most recent, etc.)
      const mostRecentResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-recent-tip-id",
        [Cl.uint(0)],
        deployer
      );
      expect(mostRecentResult.result).toBeSome(Cl.uint(3)); // Most recent = ID 3
      
      const secondRecentResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-recent-tip-id",
        [Cl.uint(1)],
        deployer
      );
      expect(secondRecentResult.result).toBeSome(Cl.uint(2)); // Second recent = ID 2
      
      const thirdRecentResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-recent-tip-id",
        [Cl.uint(2)],
        deployer
      );
      expect(thirdRecentResult.result).toBeSome(Cl.uint(1)); // Third recent = ID 1
      
      // Out of bounds returns none
      const outOfBoundsResult = simnet.callReadOnlyFn(
        CONTRACT_NAME,
        "get-recent-tip-id",
        [Cl.uint(10)],
        deployer
      );
      expect(outOfBoundsResult.result).toBeNone();
    });
  });
});
