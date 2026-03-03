;; tip-receipts-testnet.clar
;; SIP-009 NFT Contract for Tip Receipt Collectibles - TESTNET VERSION
;; Every tip mints a unique, tiered collectible NFT

;; ============================================================
;; TRAITS (TESTNET)
;; ============================================================

;; Official SIP-009 testnet trait from https://docs.stacks.co/get-started/create-a-token/non-fungible-tokens
(impl-trait 'ST1NXBK3K5YYMD6FD41MVNP3JS1GABZ8TRVX023PT.nft-trait.nft-trait)

;; ============================================================
;; CONSTANTS
;; ============================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-ALREADY-MINTED (err u409))
(define-constant ERR-NOT-TOKEN-OWNER (err u403))

;; Tier thresholds (in sats)
(define-constant TIER-BRONZE u1)      ;; < 1,000 sats
(define-constant TIER-SILVER u2)      ;; 1,000 - 9,999 sats
(define-constant TIER-GOLD u3)        ;; 10,000 - 99,999 sats
(define-constant TIER-DIAMOND u4)     ;; 100,000+ sats

;; ============================================================
;; DATA VARIABLES
;; ============================================================

(define-data-var last-token-id uint u0)
(define-data-var base-uri (string-ascii 256) "https://satspresso.io/api/testnet/receipt/")

;; ============================================================
;; DATA MAPS
;; ============================================================

;; NFT ownership
(define-non-fungible-token tip-receipt uint)

;; Token metadata
(define-map token-metadata uint {
  tip-id: uint,
  tipper: principal,
  creator: principal,
  amount: uint,
  tier: uint,
  minted-at: uint
})

;; Track which tips have been minted
(define-map tip-minted uint bool)

;; Tier counts per user (for stats)
(define-map user-tier-counts principal {
  bronze: uint,
  silver: uint,
  gold: uint,
  diamond: uint
})