export type Tier = "bronze" | "silver" | "gold" | "diamond";

export const getTier = (sats: number): Tier => {
  if (sats >= 100000) return "diamond";
  if (sats >= 50000) return "gold";
  if (sats >= 10000) return "silver";
  return "bronze";
};

export const tierConfig: Record<Tier, { label: string; emoji: string; color: string; min: number }> = {
  bronze: { label: "Bronze", emoji: "🥉", color: "text-orange-400", min: 1000 },
  silver: { label: "Silver", emoji: "🥈", color: "text-gray-300", min: 10000 },
  gold: { label: "Gold", emoji: "🥇", color: "text-yellow-400", min: 50000 },
  diamond: { label: "Diamond", emoji: "💎", color: "text-cyan-400", min: 100000 },
};

export const mockCreator = {
  name: "Satoshi Studio",
  address: "SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7",
  shortAddress: "SP2J...9EJ7",
  bio: "Digital artist exploring the intersection of Bitcoin and generative art. Building the future, one sat at a time.",
  avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=satoshi&backgroundColor=f59e0b",
  totalSats: 2450000,
  tipCount: 347,
  rank: 12,
  supporters: 89,
  goal: { title: "New Drawing Tablet", target: 500000, current: 225000 },
};

export const mockTipHistory = [
  { id: "1", sender: "CryptoArtFan", amount: 50000, message: "Love your latest piece! 🎨", tier: "gold" as Tier, timestamp: "2026-02-20T14:30:00Z" },
  { id: "2", sender: "BitcoinMaxi", amount: 100000, message: "Diamond hands support diamond artists 💎", tier: "diamond" as Tier, timestamp: "2026-02-19T09:15:00Z" },
  { id: "3", sender: "StacksSurfer", amount: 5000, message: "Keep creating!", tier: "bronze" as Tier, timestamp: "2026-02-18T22:45:00Z" },
  { id: "4", sender: "SatsCollector", amount: 10000, message: "Your NFTs are incredible", tier: "silver" as Tier, timestamp: "2026-02-18T16:20:00Z" },
  { id: "5", sender: "LightningLover", amount: 25000, message: "Zapping some sats your way ⚡", tier: "silver" as Tier, timestamp: "2026-02-17T11:00:00Z" },
  { id: "6", sender: "NodeRunner", amount: 1000, message: "First tip!", tier: "bronze" as Tier, timestamp: "2026-02-16T08:30:00Z" },
  { id: "7", sender: "HODLer2024", amount: 75000, message: "To the moon and beyond 🚀", tier: "gold" as Tier, timestamp: "2026-02-15T19:00:00Z" },
  { id: "8", sender: "DeFiDegen", amount: 3000, message: "Nice work", tier: "bronze" as Tier, timestamp: "2026-02-14T14:00:00Z" },
];

export const mockRecentTips = [
  { sender: "CryptoArtFan", receiver: "Satoshi Studio", amount: 50000, timestamp: "2m ago" },
  { sender: "BitcoinMaxi", receiver: "PodcastPro", amount: 100000, timestamp: "5m ago" },
  { sender: "StacksSurfer", receiver: "CodeWizard", amount: 5000, timestamp: "8m ago" },
  { sender: "SatsCollector", receiver: "MusicMaven", amount: 10000, timestamp: "12m ago" },
  { sender: "LightningLover", receiver: "Satoshi Studio", amount: 25000, timestamp: "15m ago" },
  { sender: "NodeRunner", receiver: "ArtBlock42", amount: 1000, timestamp: "20m ago" },
  { sender: "HODLer2024", receiver: "GameDev3D", amount: 75000, timestamp: "25m ago" },
  { sender: "DeFiDegen", receiver: "WriterDAO", amount: 3000, timestamp: "30m ago" },
];

export const mockNFTReceipts = [
  { id: "NFT-001", serial: 1, tier: "diamond" as Tier, amount: 100000, from: "BitcoinMaxi", to: "Satoshi Studio", date: "2026-02-19", message: "Diamond hands 💎", color: "from-cyan-500 to-blue-600" },
  { id: "NFT-002", serial: 2, tier: "gold" as Tier, amount: 50000, from: "CryptoArtFan", to: "Satoshi Studio", date: "2026-02-20", message: "Love it! 🎨", color: "from-yellow-500 to-orange-600" },
  { id: "NFT-003", serial: 3, tier: "gold" as Tier, amount: 75000, from: "HODLer2024", to: "Satoshi Studio", date: "2026-02-15", message: "To the moon 🚀", color: "from-amber-500 to-red-600" },
  { id: "NFT-004", serial: 4, tier: "silver" as Tier, amount: 10000, from: "SatsCollector", to: "Satoshi Studio", date: "2026-02-18", message: "NFTs are incredible", color: "from-gray-400 to-gray-600" },
  { id: "NFT-005", serial: 5, tier: "silver" as Tier, amount: 25000, from: "LightningLover", to: "Satoshi Studio", date: "2026-02-17", message: "Zap ⚡", color: "from-purple-500 to-indigo-600" },
  { id: "NFT-006", serial: 6, tier: "bronze" as Tier, amount: 5000, from: "StacksSurfer", to: "Satoshi Studio", date: "2026-02-18", message: "Keep creating!", color: "from-orange-600 to-red-700" },
  { id: "NFT-007", serial: 7, tier: "bronze" as Tier, amount: 1000, from: "NodeRunner", to: "Satoshi Studio", date: "2026-02-16", message: "First tip!", color: "from-green-500 to-teal-600" },
  { id: "NFT-008", serial: 8, tier: "bronze" as Tier, amount: 3000, from: "DeFiDegen", to: "Satoshi Studio", date: "2026-02-14", message: "Nice work", color: "from-pink-500 to-rose-600" },
];

export const mockBadges = [
  { id: "first-sip", name: "First Sip", emoji: "☕", description: "Received your first tip", earned: true, progress: 100 },
  { id: "regular", name: "Regular", emoji: "☕☕", description: "Received 10 tips", earned: true, progress: 100 },
  { id: "connoisseur", name: "Connoisseur", emoji: "☕☕☕", description: "Received 100 tips", earned: false, progress: 68, claimable: false },
  { id: "whale", name: "Whale", emoji: "💎", description: "Received a 100k+ sat tip", earned: true, progress: 100 },
  { id: "streak-master", name: "Streak Master", emoji: "🔥", description: "7-day tip streak", earned: false, progress: 42, claimable: false },
  { id: "top-supporter", name: "Top Supporter", emoji: "👑", description: "Top 10 on leaderboard", earned: false, progress: 85, claimable: true },
];

export const mockLeaderboard = [
  { rank: 1, name: "CryptoPicasso", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=cp", totalSats: 12500000, tipCount: 1247, badges: ["💎", "👑", "🔥"] },
  { rank: 2, name: "BitBard", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bb", totalSats: 9800000, tipCount: 892, badges: ["💎", "🔥"] },
  { rank: 3, name: "SatoshiSketch", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ss", totalSats: 7200000, tipCount: 654, badges: ["💎", "☕☕☕"] },
  { rank: 4, name: "LightningArtist", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=la", totalSats: 5400000, tipCount: 543, badges: ["🔥", "☕☕☕"] },
  { rank: 5, name: "BlockchainBeat", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bbb", totalSats: 4100000, tipCount: 421, badges: ["☕☕☕"] },
  { rank: 6, name: "StacksCreative", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=sc", totalSats: 3800000, tipCount: 389, badges: ["🔥"] },
  { rank: 7, name: "NodeNinja", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=nn", totalSats: 3200000, tipCount: 312, badges: ["☕☕"] },
  { rank: 8, name: "HashWriter", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hw", totalSats: 2800000, tipCount: 278, badges: ["☕☕"] },
  { rank: 9, name: "MinerMuse", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=mm", totalSats: 2600000, tipCount: 256, badges: ["☕☕"] },
  { rank: 10, name: "PeerPainter", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=pp", totalSats: 2500000, tipCount: 234, badges: ["☕"] },
  { rank: 11, name: "ChainComposer", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=cc", totalSats: 2480000, tipCount: 220, badges: ["☕"] },
  { rank: 12, name: "Satoshi Studio", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=satoshi&backgroundColor=f59e0b", totalSats: 2450000, tipCount: 347, badges: ["💎", "☕☕"], isCurrentUser: true },
];

export const creatorCategories = ["All", "Art", "Music", "Podcasts", "Dev", "Writing", "Gaming"] as const;
export type CreatorCategory = (typeof creatorCategories)[number];

export const mockCreators = [
  { name: "CryptoPicasso", address: "SP1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=cp", bio: "Generative artist pushing boundaries of on-chain art. Every piece tells a Bitcoin story.", category: "Art" as CreatorCategory, totalSats: 12500000, tipCount: 1247, supporters: 312, featured: true, socialLinks: { twitter: "https://twitter.com/cryptopicasso", github: "https://github.com/cryptopicasso", website: "https://cryptopicasso.art" }, goal: { title: "New Studio Equipment", target: 15000000, current: 12500000 } },
  { name: "BitBard", address: "SP2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bb", bio: "Writing the definitive guide to Bitcoin culture. Poet, essayist, and digital storyteller.", category: "Writing" as CreatorCategory, totalSats: 9800000, tipCount: 892, supporters: 245, featured: true, socialLinks: { twitter: "https://twitter.com/bitbard", website: "https://bitbard.xyz" }, goal: { title: "Publish Bitcoin Poetry Book", target: 12000000, current: 9800000 } },
  { name: "SatoshiSketch", address: "SP3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ss", bio: "Daily Bitcoin sketches and comic strips. Making crypto approachable through art.", category: "Art" as CreatorCategory, totalSats: 7200000, tipCount: 654, supporters: 189, featured: false, goal: { title: "Launch Comic Series", target: 10000000, current: 7200000 } },
  { name: "LightningArtist", address: "SP4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=la", bio: "Electronic music producer. Every beat is a block, every drop is a halving.", category: "Music" as CreatorCategory, totalSats: 5400000, tipCount: 543, supporters: 156, featured: true, socialLinks: { twitter: "https://twitter.com/lightningartist", github: "https://github.com/lightningartist" }, goal: { title: "Professional Album Production", target: 8000000, current: 5400000 } },
  { name: "BlockchainBeat", address: "SP5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bbb", bio: "Weekly podcast covering Bitcoin development and the creator economy.", category: "Podcasts" as CreatorCategory, totalSats: 4100000, tipCount: 421, supporters: 134, featured: false, goal: { title: "Upgrade Podcast Studio", target: 5000000, current: 4100000 } },
  { name: "StacksCreative", address: "SP6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=sc", bio: "Full-stack developer building open-source tools for the Bitcoin ecosystem.", category: "Dev" as CreatorCategory, totalSats: 3800000, tipCount: 389, supporters: 98, featured: true, socialLinks: { github: "https://github.com/stackscreative", website: "https://stackscreative.dev" }, goal: { title: "Open Source Grant Fund", target: 10000000, current: 3800000 } },
  { name: "NodeNinja", address: "SP7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=nn", bio: "Stacks smart contract wizard. Building the decentralized future one Clarity function at a time.", category: "Dev" as CreatorCategory, totalSats: 3200000, tipCount: 312, supporters: 87, featured: false, goal: { title: "Clarity Dev Bootcamp", target: 5000000, current: 3200000 } },
  { name: "HashWriter", address: "SP8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hw", bio: "Long-form essays on Bitcoin philosophy and economic freedom.", category: "Writing" as CreatorCategory, totalSats: 2800000, tipCount: 278, supporters: 76, featured: false, goal: { title: "Bitcoin Essay Anthology", target: 4000000, current: 2800000 } },
  { name: "PixelMiner", address: "SP9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=pm", bio: "Retro pixel art meets Bitcoin. Creating collectible game assets on Stacks.", category: "Gaming" as CreatorCategory, totalSats: 2600000, tipCount: 256, supporters: 112, featured: true, socialLinks: { twitter: "https://twitter.com/pixelminer" }, goal: { title: "Pixel Art Game Launch", target: 5000000, current: 2600000 } },
  { name: "MinerMuse", address: "SP0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=mm", bio: "Lo-fi beats and ambient soundscapes for the Bitcoin community.", category: "Music" as CreatorCategory, totalSats: 2500000, tipCount: 234, supporters: 67, featured: false, goal: { title: "Lo-fi Vinyl Pressing", target: 3500000, current: 2500000 } },
  { name: "ChainCaster", address: "SP1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ccc", bio: "Daily Bitcoin news and interviews with builders. Your morning crypto briefing.", category: "Podcasts" as CreatorCategory, totalSats: 2100000, tipCount: 198, supporters: 89, featured: false, goal: { title: "Live Event Series", target: 3000000, current: 2100000 } },
  { name: "BlockQuest", address: "SP2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bq", bio: "Indie game developer building play-to-earn experiences on Bitcoin L2s.", category: "Gaming" as CreatorCategory, totalSats: 1800000, tipCount: 167, supporters: 54, featured: false, goal: { title: "Multiplayer Beta Launch", target: 3000000, current: 1800000 } },
];

export const formatSats = (sats: number): string => {
  if (sats >= 1000000) return `${(sats / 1000000).toFixed(1)}M`;
  if (sats >= 1000) return `${(sats / 1000).toFixed(0)}k`;
  return sats.toString();
};

// Tip Battles
export type BattleStatus = "active" | "upcoming" | "completed";

export interface BattleTip {
  id: string;
  sender: string;
  creatorSide: "A" | "B";
  amount: number;
  timestamp: string;
}

export interface Battle {
  id: string;
  creatorA: { name: string; avatar: string; address: string };
  creatorB: { name: string; avatar: string; address: string };
  status: BattleStatus;
  startTime: string;
  endTime: string;
  tipsA: { totalSats: number; count: number; supporters: number };
  tipsB: { totalSats: number; count: number; supporters: number };
  wager: number;
  recentTips: BattleTip[];
}

const now = new Date();
const h = (hours: number) => new Date(now.getTime() + hours * 3600000).toISOString();
const hAgo = (hours: number) => new Date(now.getTime() - hours * 3600000).toISOString();

export const mockBattles: Battle[] = [
  {
    id: "battle-1",
    creatorA: { name: "CryptoPicasso", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=cp", address: "SP1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S" },
    creatorB: { name: "SatoshiSketch", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ss", address: "SP3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U" },
    status: "active",
    startTime: hAgo(2),
    endTime: h(4),
    tipsA: { totalSats: 185000, count: 24, supporters: 12 },
    tipsB: { totalSats: 142000, count: 19, supporters: 9 },
    wager: 50000,
    recentTips: [
      { id: "bt-1", sender: "HODLer2024", creatorSide: "A", amount: 10000, timestamp: "1m ago" },
      { id: "bt-2", sender: "LightningLover", creatorSide: "B", amount: 5000, timestamp: "3m ago" },
      { id: "bt-3", sender: "NodeRunner", creatorSide: "A", amount: 25000, timestamp: "5m ago" },
      { id: "bt-4", sender: "DeFiDegen", creatorSide: "B", amount: 8000, timestamp: "7m ago" },
    ],
  },
  {
    id: "battle-2",
    creatorA: { name: "LightningArtist", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=la", address: "SP4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V" },
    creatorB: { name: "MinerMuse", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=mm", address: "SP0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B" },
    status: "active",
    startTime: hAgo(5),
    endTime: h(1),
    tipsA: { totalSats: 320000, count: 45, supporters: 22 },
    tipsB: { totalSats: 295000, count: 41, supporters: 18 },
    wager: 100000,
    recentTips: [
      { id: "bt-5", sender: "BitcoinMaxi", creatorSide: "A", amount: 15000, timestamp: "2m ago" },
      { id: "bt-6", sender: "StacksSurfer", creatorSide: "B", amount: 20000, timestamp: "4m ago" },
    ],
  },
  {
    id: "battle-3",
    creatorA: { name: "BitBard", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bb", address: "SP2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T" },
    creatorB: { name: "HashWriter", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hw", address: "SP8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z" },
    status: "upcoming",
    startTime: h(6),
    endTime: h(18),
    tipsA: { totalSats: 0, count: 0, supporters: 0 },
    tipsB: { totalSats: 0, count: 0, supporters: 0 },
    wager: 25000,
    recentTips: [],
  },
  {
    id: "battle-4",
    creatorA: { name: "StacksCreative", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=sc", address: "SP6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X" },
    creatorB: { name: "NodeNinja", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=nn", address: "SP7G8H9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y" },
    status: "upcoming",
    startTime: h(12),
    endTime: h(36),
    tipsA: { totalSats: 0, count: 0, supporters: 0 },
    tipsB: { totalSats: 0, count: 0, supporters: 0 },
    wager: 0,
    recentTips: [],
  },
  {
    id: "battle-5",
    creatorA: { name: "PixelMiner", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=pm", address: "SP9I0J1K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A" },
    creatorB: { name: "BlockQuest", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bq", address: "SP2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D" },
    status: "completed",
    startTime: hAgo(30),
    endTime: hAgo(6),
    tipsA: { totalSats: 890000, count: 112, supporters: 45 },
    tipsB: { totalSats: 620000, count: 87, supporters: 34 },
    wager: 75000,
    recentTips: [
      { id: "bt-7", sender: "CryptoArtFan", creatorSide: "A", amount: 50000, timestamp: "6h ago" },
      { id: "bt-8", sender: "SatsCollector", creatorSide: "B", amount: 30000, timestamp: "6h ago" },
    ],
  },
];

export const mockTipSenders = ["CryptoArtFan", "BitcoinMaxi", "StacksSurfer", "SatsCollector", "LightningLover", "NodeRunner", "HODLer2024", "DeFiDegen"];
export const mockTipAmounts = [1000, 2500, 5000, 10000, 15000, 25000, 50000, 100000, 250000];

export const generateRandomBattleTip = (): { sender: string; amount: number; side: "A" | "B" } => ({
  sender: mockTipSenders[Math.floor(Math.random() * mockTipSenders.length)],
  amount: mockTipAmounts[Math.floor(Math.random() * mockTipAmounts.length)],
  side: Math.random() > 0.5 ? "A" : "B",
});

// Monthly leaderboard (subset with lower numbers)
export const mockMonthlyLeaderboard = [
  { rank: 1, name: "LightningArtist", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=la", totalSats: 850000, tipCount: 89, badges: ["🔥", "☕☕☕"] },
  { rank: 2, name: "CryptoPicasso", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=cp", totalSats: 720000, tipCount: 76, badges: ["💎", "👑"] },
  { rank: 3, name: "BitBard", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bb", totalSats: 680000, tipCount: 71, badges: ["💎"] },
  { rank: 4, name: "StacksCreative", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=sc", totalSats: 540000, tipCount: 58, badges: ["🔥"] },
  { rank: 5, name: "NodeNinja", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=nn", totalSats: 420000, tipCount: 45, badges: ["☕☕"] },
  { rank: 6, name: "SatoshiSketch", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ss", totalSats: 380000, tipCount: 41, badges: ["☕☕"] },
  { rank: 7, name: "BlockchainBeat", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bbb", totalSats: 310000, tipCount: 34, badges: ["☕"] },
  { rank: 8, name: "HashWriter", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hw", totalSats: 280000, tipCount: 29, badges: ["☕"] },
  { rank: 9, name: "PixelMiner", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=pm", totalSats: 250000, tipCount: 26, badges: ["☕"] },
  { rank: 10, name: "Satoshi Studio", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=satoshi&backgroundColor=f59e0b", totalSats: 185000, tipCount: 22, badges: ["💎"], isCurrentUser: true },
];

// Streak data
export const mockStreakLeaderboard = [
  { rank: 1, name: "CryptoPicasso", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=cp", streakDays: 42, totalTips: 312, badges: ["🔥", "👑"] },
  { rank: 2, name: "LightningArtist", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=la", streakDays: 28, totalTips: 198, badges: ["🔥"] },
  { rank: 3, name: "BitBard", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bb", streakDays: 21, totalTips: 156, badges: ["🔥"] },
  { rank: 4, name: "StacksCreative", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=sc", streakDays: 14, totalTips: 89, badges: ["☕☕"] },
  { rank: 5, name: "NodeNinja", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=nn", streakDays: 11, totalTips: 67, badges: ["☕☕"] },
  { rank: 6, name: "SatoshiSketch", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=ss", streakDays: 9, totalTips: 54, badges: ["☕"] },
  { rank: 7, name: "HashWriter", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=hw", streakDays: 7, totalTips: 43, badges: ["☕"] },
  { rank: 8, name: "Satoshi Studio", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=satoshi&backgroundColor=f59e0b", streakDays: 5, totalTips: 22, badges: ["☕"], isCurrentUser: true },
  { rank: 9, name: "BlockchainBeat", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=bbb", streakDays: 3, totalTips: 18, badges: [] },
  { rank: 10, name: "PixelMiner", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=pm", streakDays: 2, totalTips: 12, badges: [] },
];
