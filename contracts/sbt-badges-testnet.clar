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