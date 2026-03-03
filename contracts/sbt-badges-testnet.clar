;; sbt-badges-testnet.clar
;; Soul-Bound Token (SBT) Badges for Sats-Presso - TESTNET VERSION
;; Non-transferable achievement badges

;; ============================================================
;; CONSTANTS
;; ============================================================

(define-constant CONTRACT-OWNER tx-sender)
(define-constant ERR-NOT-AUTHORIZED (err u401))
(define-constant ERR-NOT-FOUND (err u404))
(define-constant ERR-ALREADY-CLAIMED (err u409))
(define-constant ERR-NOT-ELIGIBLE (err u403))
(define-constant ERR-TRANSFER-BLOCKED (err u405))
(define-constant ERR-INVALID-BADGE (err u400))

;; Badge Type IDs
(define-constant BADGE-FIRST-SIP u1)       ;; First tip sent
(define-constant BADGE-REGULAR u2)         ;; 10+ tips sent
(define-constant BADGE-CONNOISSEUR u3)     ;; 100+ tips sent
(define-constant BADGE-WHALE u4)           ;; 1M+ sats tipped
(define-constant BADGE-STREAK-7 u5)        ;; 7-day tip streak
(define-constant BADGE-STREAK-30 u6)       ;; 30-day tip streak
(define-constant BADGE-TOP-SUPPORTER u7)   ;; #1 supporter of any creator
(define-constant BADGE-BATTLE-VICTOR u8)   ;; Won a tip battle
(define-constant BADGE-EARLY-ADOPTER u9)   ;; First 1000 users
(define-constant BADGE-DIAMOND-HANDS u10)  ;; 10+ diamond tier tips

;; Badge requirements
(define-constant REQ-REGULAR-TIPS u10)
(define-constant REQ-CONNOISSEUR-TIPS u100)
(define-constant REQ-WHALE-SATS u1000000)
(define-constant REQ-DIAMOND-TIPS u10)

;; ============================================================
;; DATA VARIABLES
;; ============================================================

(define-data-var last-badge-id uint u0)
(define-data-var total-users uint u0)
(define-data-var early-adopter-limit uint u1000)
(define-data-var base-uri (string-ascii 256) "https://satspresso.io/api/testnet/badge/")

;; ============================================================
;; DATA MAPS
;; ============================================================

;; SBT - Non-fungible but non-transferable
(define-non-fungible-token sbt-badge uint)

;; Badge metadata
(define-map badge-metadata uint {
  badge-type: uint,
  owner: principal,
  earned-at: uint,
  description: (string-utf8 100)
})

;; Track which badges each user has
(define-map user-badges principal (list 20 uint))

;; Track if user has specific badge type
(define-map user-has-badge { user: principal, badge-type: uint } bool)

;; User stats (for eligibility checking)
(define-map user-stats principal {
  tips-sent: uint,
  total-sats-tipped: uint,
  diamond-tips: uint,
  current-streak: uint,
  max-streak: uint,
  battles-won: uint
})

;; Badge type metadata
(define-map badge-types uint {
  name: (string-utf8 30),
  description: (string-utf8 100),
  emoji: (string-ascii 10)
})

;; ============================================================
;; INITIALIZATION
;; ============================================================

;; Initialize badge types
(map-set badge-types BADGE-FIRST-SIP {
  name: u"First Sip",
  description: u"Sent your first tip on Sats-Presso",
  emoji: "coffee1"
})

(map-set badge-types BADGE-REGULAR {
  name: u"Regular",
  description: u"Sent 10 or more tips",
  emoji: "coffee2"
})

(map-set badge-types BADGE-CONNOISSEUR {
  name: u"Connoisseur",
  description: u"Sent 100 or more tips",
  emoji: "coffee3"
})

(map-set badge-types BADGE-WHALE {
  name: u"Whale",
  description: u"Tipped over 1 million sats total",
  emoji: "diamond"
})

(map-set badge-types BADGE-STREAK-7 {
  name: u"Week Warrior",
  description: u"Maintained a 7-day tipping streak",
  emoji: "fire1"
})

(map-set badge-types BADGE-STREAK-30 {
  name: u"Streak Master",
  description: u"Maintained a 30-day tipping streak",
  emoji: "fire2"
})

(map-set badge-types BADGE-TOP-SUPPORTER {
  name: u"Top Supporter",
  description: u"Became #1 supporter of a creator",
  emoji: "crown"
})

(map-set badge-types BADGE-BATTLE-VICTOR {
  name: u"Battle Victor",
  description: u"Won a tip battle",
  emoji: "sword"
})

(map-set badge-types BADGE-EARLY-ADOPTER {
  name: u"Early Adopter",
  description: u"Among the first 1000 users",
  emoji: "star"
})

(map-set badge-types BADGE-DIAMOND-HANDS {
  name: u"Diamond Hands",
  description: u"Sent 10 or more diamond-tier tips",
  emoji: "diamond2"
})

;; ============================================================
;; SBT FUNCTIONS (Modified SIP-009 - Non-transferable)
;; ============================================================

(define-read-only (get-last-token-id)
  (ok (var-get last-badge-id))
)

(define-read-only (get-token-uri (token-id uint))
  (ok (some (var-get base-uri)))
)

(define-read-only (get-owner (token-id uint))
  (ok (nft-get-owner? sbt-badge token-id))
)

;; BLOCKED - Soul-bound tokens cannot be transferred
(define-public (transfer (token-id uint) (sender principal) (recipient principal))
  ERR-TRANSFER-BLOCKED
)

;; ============================================================
;; CORE FUNCTIONS
;; ============================================================

;; Record a tip (called by tip-jar contract or admin)
(define-public (record-tip (tipper principal) (amount uint))
  (let (
    (current-stats (default-to 
      { tips-sent: u0, total-sats-tipped: u0, diamond-tips: u0, current-streak: u0, max-streak: u0, battles-won: u0 }
      (map-get? user-stats tipper)
    ))
    (is-diamond (>= amount u100000))
  )
    ;; Only contract owner or tip-jar can call this
    (asserts! (is-eq tx-sender CONTRACT-OWNER) ERR-NOT-AUTHORIZED)
    
    ;; Update stats
    (map-set user-stats tipper {
      tips-sent: (+ (get tips-sent current-stats) u1),
      total-sats-tipped: (+ (get total-sats-tipped current-stats) amount),
      diamond-tips: (if is-diamond 
        (+ (get diamond-tips current-stats) u1) 
        (get diamond-tips current-stats)
      ),
      current-streak: (get current-streak current-stats),
      max-streak: (get max-streak current-stats),
      battles-won: (get battles-won current-stats)
    })
    
    (print {
      event: "tip-recorded",
      tipper: tipper,
      amount: amount,
      is-diamond: is-diamond
    })
    
    (ok true)
  )
)

;; Claim a badge (user calls this)
(define-public (claim-badge (badge-type uint))
  (let (
    (sender tx-sender)
    (stats (default-to 
      { tips-sent: u0, total-sats-tipped: u0, diamond-tips: u0, current-streak: u0, max-streak: u0, battles-won: u0 }
      (map-get? user-stats sender)
    ))
  )
    ;; Check badge type is valid
    (asserts! (and (>= badge-type u1) (<= badge-type u10)) ERR-INVALID-BADGE)
    
    ;; Check not already claimed
    (asserts! (not (has-badge sender badge-type)) ERR-ALREADY-CLAIMED)
    
    ;; Check eligibility based on badge type
    (asserts! (check-eligibility sender badge-type stats) ERR-NOT-ELIGIBLE)
    
    ;; Mint the badge
    (mint-badge sender badge-type)
  )
)

;; Check if user is eligible for a badge
(define-private (check-eligibility 
  (user principal) 
  (badge-type uint) 
  (stats { tips-sent: uint, total-sats-tipped: uint, diamond-tips: uint, current-streak: uint, max-streak: uint, battles-won: uint })
)
  (if (is-eq badge-type BADGE-FIRST-SIP)
    (>= (get tips-sent stats) u1)
    (if (is-eq badge-type BADGE-REGULAR)
      (>= (get tips-sent stats) REQ-REGULAR-TIPS)
      (if (is-eq badge-type BADGE-CONNOISSEUR)
        (>= (get tips-sent stats) REQ-CONNOISSEUR-TIPS)
        (if (is-eq badge-type BADGE-WHALE)
          (>= (get total-sats-tipped stats) REQ-WHALE-SATS)
          (if (is-eq badge-type BADGE-STREAK-7)
            (>= (get max-streak stats) u7)
            (if (is-eq badge-type BADGE-STREAK-30)
              (>= (get max-streak stats) u30)
              (if (is-eq badge-type BADGE-DIAMOND-HANDS)
                (>= (get diamond-tips stats) REQ-DIAMOND-TIPS)
                (if (is-eq badge-type BADGE-EARLY-ADOPTER)
                  (<= (var-get total-users) (var-get early-adopter-limit))
                  (if (is-eq badge-type BADGE-BATTLE-VICTOR)
                    (>= (get battles-won stats) u1)
                    false
                  )
                )
              )
            )
          )
        )
      )
    )
  )
)