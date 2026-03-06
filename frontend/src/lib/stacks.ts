import { connect, disconnect, isConnected, request } from '@stacks/connect';
import type { GetAddressesResult } from '@stacks/connect/dist/types/methods';
import { Cl, fetchCallReadOnlyFunction, cvToJSON, type ClarityValue } from '@stacks/transactions';

// ============================================================
// CONFIG
// ============================================================

export const NETWORK = 'testnet' as const;
export const HIRO_API = 'https://api.testnet.hiro.so';

export const CONTRACTS = {
  TIP_JAR: 'ST2YQD7SYCR9C7AA1J6VT17T28CK10XEEHPB0VMWH.tip-jar-testnet',
  TIP_RECEIPTS: 'ST2YQD7SYCR9C7AA1J6VT17T28CK10XEEHPB0VMWH.tip-receipts-testnet',
  SBT_BADGES: 'ST2YQD7SYCR9C7AA1J6VT17T28CK10XEEHPB0VMWH.sbt-badges-testnet',
  SBTC_TOKEN: 'ST1F7QA2MDF17S807EPA36TSS8AMEFY4KA9TVGWXT.sbtc-token',
} as const;

const [CONTRACT_ADDRESS] = CONTRACTS.TIP_JAR.split('.');

// ============================================================
// WALLET
// ============================================================

export async function connectWallet(): Promise<GetAddressesResult> {
  const response = await connect({ network: NETWORK });
  return response;
}

export function disconnectWallet() {
  disconnect();
}

export function isWalletConnected(): boolean {
  return isConnected();
}

/** Get the STX address from a connect() response (index 2 = Stacks address) */
export function getStxAddress(response: GetAddressesResult): string {
  return response.addresses[2].address;
}

// ============================================================
// READ-ONLY HELPERS
// ============================================================

function splitContract(contract: string) {
  const [contractAddress, contractName] = contract.split('.');
  return { contractAddress, contractName };
}

async function readOnly(
  contract: string,
  functionName: string,
  args: ClarityValue[] = [],
  senderAddress?: string,
) {
  const { contractAddress, contractName } = splitContract(contract);
  const result = await fetchCallReadOnlyFunction({
    contractAddress,
    contractName,
    functionName,
    functionArgs: args,
    network: NETWORK,
    senderAddress: senderAddress ?? contractAddress,
  });
  return cvToJSON(result);
}

// ============================================================
// TIP JAR — READ-ONLY
// ============================================================

export async function getCreator(creator: string) {
  return readOnly(CONTRACTS.TIP_JAR, 'get-creator', [Cl.principal(creator)], creator);
}

export async function getCreatorGoal(creator: string) {
  return readOnly(CONTRACTS.TIP_JAR, 'get-creator-goal', [Cl.principal(creator)], creator);
}

export async function getGoalProgress(creator: string) {
  return readOnly(CONTRACTS.TIP_JAR, 'get-goal-progress', [Cl.principal(creator)], creator);
}

export async function getCreatorPresets(creator: string) {
  return readOnly(CONTRACTS.TIP_JAR, 'get-creator-presets', [Cl.principal(creator)], creator);
}

export async function getTip(tipId: number) {
  return readOnly(CONTRACTS.TIP_JAR, 'get-tip', [Cl.uint(tipId)]);
}

export async function getCreatorTipAtIndex(creator: string, index: number) {
  return readOnly(CONTRACTS.TIP_JAR, 'get-creator-tip-at-index', [
    Cl.principal(creator),
    Cl.uint(index),
  ], creator);
}

export async function getTipperTipAtIndex(tipper: string, index: number) {
  return readOnly(CONTRACTS.TIP_JAR, 'get-tipper-tip-at-index', [
    Cl.principal(tipper),
    Cl.uint(index),
  ], tipper);
}

export async function getTipperTipCount(tipper: string) {
  return readOnly(CONTRACTS.TIP_JAR, 'get-tipper-tip-count', [Cl.principal(tipper)], tipper);
}

export async function getTotalTipsProcessed() {
  return readOnly(CONTRACTS.TIP_JAR, 'get-total-tips-processed');
}

export async function getTotalCreators() {
  return readOnly(CONTRACTS.TIP_JAR, 'get-total-creators');
}

export async function getTipCount() {
  return readOnly(CONTRACTS.TIP_JAR, 'get-tip-count');
}

export async function checkIsCreator(principal: string) {
  return readOnly(CONTRACTS.TIP_JAR, 'is-creator', [Cl.principal(principal)], principal);
}

// ============================================================
// TIP JAR — TRANSACTIONS
// ============================================================

export async function registerCreator(name: string, bio: string) {
  return request('stx_callContract', {
    contract: CONTRACTS.TIP_JAR,
    functionName: 'register-creator',
    functionArgs: [Cl.stringUtf8(name), Cl.stringUtf8(bio)],
    network: NETWORK,
  });
}

export async function updateProfile(name: string, bio: string) {
  return request('stx_callContract', {
    contract: CONTRACTS.TIP_JAR,
    functionName: 'update-profile',
    functionArgs: [Cl.stringUtf8(name), Cl.stringUtf8(bio)],
    network: NETWORK,
  });
}

export async function setGoal(amount: number, description: string, deadline: number) {
  return request('stx_callContract', {
    contract: CONTRACTS.TIP_JAR,
    functionName: 'set-goal',
    functionArgs: [Cl.uint(amount), Cl.stringUtf8(description), Cl.uint(deadline)],
    network: NETWORK,
  });
}

export async function deactivateGoal() {
  return request('stx_callContract', {
    contract: CONTRACTS.TIP_JAR,
    functionName: 'deactivate-goal',
    functionArgs: [],
    network: NETWORK,
  });
}

export async function setPresets(p1: number, p2: number, p3: number, p4: number, p5: number) {
  return request('stx_callContract', {
    contract: CONTRACTS.TIP_JAR,
    functionName: 'set-presets',
    functionArgs: [Cl.uint(p1), Cl.uint(p2), Cl.uint(p3), Cl.uint(p4), Cl.uint(p5)],
    network: NETWORK,
  });
}

export async function sendTip(creator: string, amount: number, message: string) {
  return request('stx_callContract', {
    contract: CONTRACTS.TIP_JAR,
    functionName: 'send-tip',
    functionArgs: [Cl.principal(creator), Cl.uint(amount), Cl.stringUtf8(message)],
    network: NETWORK,
  });
}

// ============================================================
// TIP RECEIPTS — READ-ONLY
// ============================================================

export async function getReceiptTier(amount: number) {
  return readOnly(CONTRACTS.TIP_RECEIPTS, 'get-tier', [Cl.uint(amount)]);
}

export async function getTokenMetadata(tokenId: number) {
  return readOnly(CONTRACTS.TIP_RECEIPTS, 'get-token-metadata', [Cl.uint(tokenId)]);
}

export async function isTipMinted(tipId: number) {
  return readOnly(CONTRACTS.TIP_RECEIPTS, 'is-tip-minted', [Cl.uint(tipId)]);
}

export async function getUserTierCounts(user: string) {
  return readOnly(CONTRACTS.TIP_RECEIPTS, 'get-user-tier-counts', [Cl.principal(user)], user);
}

export async function getTotalMinted() {
  return readOnly(CONTRACTS.TIP_RECEIPTS, 'get-total-minted');
}

export async function getLastTokenId() {
  return readOnly(CONTRACTS.TIP_RECEIPTS, 'get-last-token-id');
}

// ============================================================
// TIP RECEIPTS — TRANSACTIONS
// ============================================================

export async function mintReceipt(tipId: number, tipper: string, creator: string, amount: number) {
  return request('stx_callContract', {
    contract: CONTRACTS.TIP_RECEIPTS,
    functionName: 'mint-receipt',
    functionArgs: [Cl.uint(tipId), Cl.principal(tipper), Cl.principal(creator), Cl.uint(amount)],
    network: NETWORK,
  });
}

// ============================================================
// SBT BADGES — READ-ONLY
// ============================================================

export async function hasBadge(user: string, badgeType: number) {
  return readOnly(CONTRACTS.SBT_BADGES, 'has-badge', [Cl.principal(user), Cl.uint(badgeType)], user);
}

export async function getUserStats(user: string) {
  return readOnly(CONTRACTS.SBT_BADGES, 'get-user-stats', [Cl.principal(user)], user);
}

export async function getClaimableBadges(user: string) {
  return readOnly(CONTRACTS.SBT_BADGES, 'get-claimable-badges', [Cl.principal(user)], user);
}

export async function getBadgeTypeInfo(badgeType: number) {
  return readOnly(CONTRACTS.SBT_BADGES, 'get-badge-type-info', [Cl.uint(badgeType)]);
}

export async function getTotalBadgesMinted() {
  return readOnly(CONTRACTS.SBT_BADGES, 'get-total-badges-minted');
}

export async function getBadgeMetadata(badgeId: number) {
  return readOnly(CONTRACTS.SBT_BADGES, 'get-badge-metadata', [Cl.uint(badgeId)]);
}

// ============================================================
// SBT BADGES — TRANSACTIONS
// ============================================================

export async function claimBadge(badgeType: number) {
  return request('stx_callContract', {
    contract: CONTRACTS.SBT_BADGES,
    functionName: 'claim-badge',
    functionArgs: [Cl.uint(badgeType)],
    network: NETWORK,
  });
}

export async function recordTip(tipper: string, amount: number) {
  return request('stx_callContract', {
    contract: CONTRACTS.SBT_BADGES,
    functionName: 'record-tip',
    functionArgs: [Cl.principal(tipper), Cl.uint(amount)],
    network: NETWORK,
  });
}

// ============================================================
// HIRO API HELPERS
// ============================================================

export async function getAccountBalance(address: string) {
  const res = await fetch(`${HIRO_API}/extended/v1/address/${address}/balances`);
  if (!res.ok) return null;
  return res.json();
}

export async function getNFTHoldings(address: string, assetIdentifier?: string) {
  const base = `${HIRO_API}/extended/v1/tokens/nft/holdings?principal=${address}`;
  const url = assetIdentifier ? `${base}&asset_identifiers=${assetIdentifier}` : base;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export async function getTxStatus(txId: string) {
  const res = await fetch(`${HIRO_API}/extended/v1/tx/${txId}`);
  if (!res.ok) return null;
  return res.json();
}

/** Fetch a list of recent contract events (for tip history etc.) */
export async function getContractEvents(contract: string, offset = 0, limit = 20) {
  const [addr, name] = contract.split('.');
  const res = await fetch(
    `${HIRO_API}/extended/v1/contract/${addr}.${name}/events?offset=${offset}&limit=${limit}`,
  );
  if (!res.ok) return null;
  return res.json();
}

/** Discover creator addresses by scanning successful register-creator transactions */
export async function discoverCreators(): Promise<string[]> {
  const res = await fetch(
    `${HIRO_API}/extended/v1/address/${CONTRACTS.TIP_JAR}/transactions?limit=50`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  const creators = new Set<string>();
  for (const tx of data.results ?? []) {
    if (
      tx.tx_type === 'contract_call' &&
      tx.contract_call?.function_name === 'register-creator' &&
      tx.tx_status === 'success'
    ) {
      creators.add(tx.sender_address);
    }
  }
  return [...creators];
}

// ============================================================
// UTILITY: Parse Clarity values from JSON
// ============================================================

/** Unwrap a Clarity optional/response value from cvToJSON output */
export function unwrapCV(cv: any): any {
  if (!cv) return null;
  if (cv.success === false) return null;
  // (optional none) / (none)
  if (cv.type === '(optional none)' || cv.type === 'none') {
    return null;
  }
  // (ok ...) or (some ...) or (optional ...) — unwrap inner value
  if (cv.value !== undefined && cv.type && (cv.type.startsWith('(ok') || cv.type.startsWith('(some') || cv.type.startsWith('(optional'))) {
    return unwrapCV(cv.value);
  }
  // tuple — either has explicit (tuple type or is a plain object with nested CV entries
  if (cv.type && cv.type.startsWith('(tuple')) {
    const obj: Record<string, any> = {};
    for (const [key, val] of Object.entries(cv.value as Record<string, any>)) {
      obj[key] = unwrapCV(val);
    }
    return obj;
  }
  // Plain object with nested CV entries (tuple content unwrapped from optional)
  if (!cv.type && typeof cv === 'object' && !Array.isArray(cv)) {
    const keys = Object.keys(cv);
    if (keys.length > 0 && cv[keys[0]]?.type) {
      const obj: Record<string, any> = {};
      for (const [key, val] of Object.entries(cv)) {
        obj[key] = unwrapCV(val);
      }
      return obj;
    }
  }
  // uint / int
  if (cv.type === 'uint' || cv.type === 'int') {
    return Number(cv.value);
  }
  // bool
  if (cv.type === 'bool') {
    return cv.value;
  }
  // principal
  if (cv.type === 'principal') {
    return cv.value;
  }
  // string
  if (cv.type && cv.type.includes('string')) {
    return cv.value;
  }
  // none (fallback for any remaining none patterns)
  if (cv.type && cv.type.includes('none')) {
    return null;
  }
  // list
  if (cv.type && cv.type.startsWith('(list')) {
    return (cv.value as any[]).map(unwrapCV);
  }
  // fallback
  return cv.value ?? cv;
}
