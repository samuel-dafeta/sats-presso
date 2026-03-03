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

;; ============================================================
;; SIP-009 FUNCTIONS
;; ============================================================

(define-read-only (get-last-token-id)
  (ok (var-get last-token-id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok (some (var-get base-uri)))
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? tip-receipt token-id))
)

(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  (begin
    (asserts! (is-eq tx-sender sender) ERR-NOT-AUTHORIZED)
    (nft-transfer? tip-receipt token-id sender recipient)
  )
)

;; ============================================================
;; CORE FUNCTIONS
;; ============================================================

;; Calculate tier based on tip amount
(define-read-only (get-tier (amount uint))
  (if (>= amount u100000)
    TIER-DIAMOND
    (if (>= amount u10000)
      TIER-GOLD
      (if (>= amount u1000)
        TIER-SILVER
        TIER-BRONZE
      )
    )
  )
)

;; Get tier name for display
(define-read-only (get-tier-name (tier uint))
  (if (is-eq tier TIER-DIAMOND)
    "DIAMOND"
    (if (is-eq tier TIER-GOLD)
      "GOLD"
      (if (is-eq tier TIER-SILVER)
        "SILVER"
        "BRONZE"
      )
    )
  )
)

;; Mint a tip receipt NFT
;; Can be called by anyone for any tip (tipper receives the NFT)
(define-public (mint-receipt 
  (tip-id uint)
  (tipper principal)
  (creator principal)
  (amount uint)
)
  (let (
    (token-id (+ (var-get last-token-id) u1))
    (tier (get-tier amount))
  )
    ;; Check tip hasn't been minted already
    (asserts! (is-none (map-get? tip-minted tip-id)) ERR-ALREADY-MINTED)
    
    ;; Mint NFT to tipper
    (try! (nft-mint? tip-receipt token-id tipper))
    
    ;; Store metadata
    (map-set token-metadata token-id {
      tip-id: tip-id,
      tipper: tipper,
      creator: creator,
      amount: amount,
      tier: tier,
      minted-at: stacks-block-height
    })
    
    ;; Mark tip as minted
    (map-set tip-minted tip-id true)
    
    ;; Update tier counts
    (update-tier-counts tipper tier)
    
    ;; Update last token ID
    (var-set last-token-id token-id)
    
    (print {
      event: "receipt-minted",
      token-id: token-id,
      tip-id: tip-id,
      tipper: tipper,
      creator: creator,
      amount: amount,
      tier: tier
    })
    
    (ok token-id)
  )
)